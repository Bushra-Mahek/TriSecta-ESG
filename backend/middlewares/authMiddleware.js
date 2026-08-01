import jwt from "jsonwebtoken";
export const authenticate = (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({error: "token not found"});
        }
        const token = authHeader.split(" ")[1];
        const user = await userModel.findById(decoded.id);

        if (!user || !user.is_active) {
            return res.status(401).json({
        message: "User no longer authorized"
        });
        }

req.user = user;
next();
        

    }
    
    catch(err){
        return res.status(401).json({
                message: "invalid token"
        });
    }
}

