import { authService } from "../services/authService.js";
// import { errorHandle } from "../middlewares/authMiddleware.js";
//import jwt from "jsonwebtoken";

export const register = async (req,res,next)=>{
    try{
    console.log("registering in controller phase");
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
            user : {
    id: response.id,
    full_name: response.full_name,
    email: response.email,
    role: response.role,
    company_id: response.company_id,
    is_verified: response.is_verified
}
        });
    }

    catch(err){
        console.error("regsiter error");
        next(err);
    }
};

export const login = async (req,res,next)=>{
    try{
        console.log("login phase in controller phase");
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message : "missing required fields"
            });
        }

        const response = await authService.loginUser(email,password);
        console.log("login successfull");
        return res.status(200).json({
            success : true,
            message: "user logged in successfully",
            token : response.token,
            user : {id: response.user.id,
                full_name: response.user.full_name,
                email: response.user.email,
                role: response.user.role,
                company_id: response.user.company_id,
                is_verified: response.user.is_verified}

        });
    }

    catch(err){
        console.log("login error");
        next(err);
    }
}

