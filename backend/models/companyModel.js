import {db} from "../config/db.js"

export const companyModel = {
    async createCompany(name,companyRgNo,industry,country,website){
        const result = await db.query(`INSERT INTO Companies(company_name,registration_number,industry,country,website) VALUES($1,$2,$3,$4,$5) RETURNING *`,[name,companyRgNo,industry,country,website]);
        return result.rows[0];
    },

    async getCompany(id){
        const result = await db.query(`SELECT * FROM Companies WHERE id = $1`,[id]);
        return result.rows[0];
    },

    async getCompanies() {
    const result = await db.query(
        `SELECT *
         FROM companies
         ORDER BY id DESC`
    );

    return result.rows;
    },

    async updateCompany(id,data){
        const result = await db.query(`UPDATE Companies SET company_name=$1,industry =$2,country = $3 ,website = $4 WHERE id=$5 RETURNING *`,[data.name, data.industry,data.country, data.website,id]);
        if(result.rowCount === 0){
            return null;
        }
        return result.rows[0];
    },

    async deleteCompany(id){
        const result = await db.query(`DELETE FROM Companies WHERE id=$1`,[id]);
        if(result.rowCount === 0){
            return false;
        }
        return true;
    },

    async getCompanyByRegistrationNumber(RgNo){
        const result = await db.query(`SELECT 1 FROM Companies WHERE registration_number = $1`,[RgNo]);
        return result.rowCount > 0;
    },


}