import { companyModel } from "../models/companyModel.js";


export const companyService = {
    async createCompany(name,companyRgNo,industry,country,website){
        const existingCompany = await companyModel.getCompanyByRegistrationNumber(companyRgNo);
        if(existingCompany){
            throw new Error("company registration number already exists");
        }
        const company = await companyModel.createCompany(name,companyRgNo,industry,country,website);
        return company;
    },

    async getCompany(id){
        const company = await companyModel.getCompany(id);
        if(!company){
            throw new Error("company not found");
        }
        return company;
    },

    async getCompanies(){
        const companies = await companyModel.getCompanies();
        return companies;
    },

    async updateCompany(id,data){
        const result = await companyModel.updateCompany(id,data);
        if(!result){
            throw new Error("company not found");
        }
        return result;
    },

    async deleteCompany(id){
        const deleted = await companyModel.deleteCompany(id);
        if(!deleted){
            throw new Error("company doesnt exist");
        }
        return deleted;
    },

}