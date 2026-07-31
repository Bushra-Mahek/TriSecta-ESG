import { authService } from "../services/authService.js";
// import { errorHandle } from "../middlewares/authMiddleware.js";
//import jwt from "jsonwebtoken";

export const register = async (req,res,next)=>{
    try{
    console.log("regestring in controller phase");
    const {fullName,email,password,role,companyId} = req.body;
    if(!fullName || !email || !password || !role){
        return res.status(400).json({
            message : "missing required fields"
        });
    }

    
        const response = await authService.registerUser(fullName,email,password,role,companyId);
        console.log("user created sucessfully");
        return res.status(201).json({
            message : "user created successfully",
            user : response
        });
    }

    catch(err){
        console.error("regsiter error");
        next(err);
    }
};

