import { db } from "../config/db.js"

export const userModel = {
    async createUser(fullName,email,passwordHash,role,companyId){
        const result = await db.query(`insert into users(full_name,email,password_hash,role,company_id) values($1,$2,$3,$4,$5) returning *`,[fullName,email,passwordHash,role,companyId]);
        return result.rows[0];
    },

    async findUserByEmail(email) {
        const result = await db.query(
            `
            SELECT *
            FROM users
            WHERE email = $1;
            `,
            [email]
        );

        return result.rows[0];
    },

    async findUserById(id) {
        const result = await db.query(
            `
            SELECT *
            FROM users
            WHERE id = $1;
            `,
            [id]
        );

        return result.rows[0];
    }

}



