import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";

export const authenticate = async (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({error: "token not found"});
        }
        const token = authHeader.split(" ")[1];

console.log("TOKEN RECEIVED:", token);

const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
);

console.log("DECODED TOKEN:", decoded);

        const user = await userModel.findUserById(decoded.id);

        if (!user || !user.is_active) {
            return res.status(401).json({
        message: "User no longer authorized"
        });
        }

        req.user = user;
        next();
        
    }
    
    catch(err) {
    console.error("AUTH ERROR:", err);

    return res.status(401).json({
        message: "invalid or expired token"
    });
    }
}

