import { companyService } from "../services/companyService.js";

export const createCompany = async (req,res,next)=>{
    try{
        console.log("company creating phase");
        const {name,RgNo,industry,country,website} = req.body;

        if(!name || !RgNo || !industry || !country){
            return res.status(400).json({message: "missing required fields"});
        }

        const result = await companyService.createCompany(name,RgNo,industry,country,website);
        console.log("company created successfully");
        return res.status(201).json({message: "company created successfully",
            company: {
    id: result.id,
    name: result.company_name,
    registrationNumber: result.registration_number,
    industry: result.industry,
    country: result.country,
    website: result.website
}}
        );
    }

    catch(err){
        console.error("Company creation error");
        next(err);
    }
}

export const viewCompany = async (req,res,next)=>{
    try{
        console.log("company get phase");
        const id = req.params.id;
        const result = await companyService.getCompany(id);
        console.log("company fetched successfully");
        return res.status(200).json({company: result});
    }

    catch(err){
        // res.status(500).json({error: "cant find company"});
        next(err);
    }
}

export const viewCompanies = async (req,res,next)=>{
    try{
        console.log("companies get phase");
        const result = await companyService.getCompanies();
        console.log("companies fetched successfully");
        return res.status(200).json({
            companies: result
        });
    }

    catch(err){
        // res.status(500).json({error: "cant find companies"});
        next(err);
    }
}

export const updateCompany = async (req,res,next)=>{
    try{
        const id = req.params.id;
        const result = await companyService.updateCompany(id,req.body);
        return res.status(200).json({message: "Company updated successfully",
            company: result});
    }

    catch(err){
        // res.status(500).json({error: "cant find company"});
        next(err);
    }
}

export const deleteCompany = async (req,res,next)=>{
    try{
        console.log("Company delete phase");
        const id = req.params.id;
        await companyService.deleteCompany(id);
        return res.status(200).json({message:" compony deleted successfully"});
    }

    catch(err){
        // res.status(500).json({error:"cant find company"});
        next(err);
    }
}