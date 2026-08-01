
export const authorize = (...allowedRules)=>{
    return (req,res,next) =>{
        if(!req.user){
            return res.status(401).json({message: "unauthorized"});
        }
        
        if(!allowedRules.includes(req.user.role)){
            return res.status(403).json({
                message: "Forbidden: You don't have permission to perform this action."
            });
        }

        next();
    };
};
