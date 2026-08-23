import { db } from "../config/db.js";

export const disclosureModel = {

    async createDisclosure(companyId, reportingYear, status, submittedBy) {
        const result = await db.query(
            `INSERT INTO disclosures
            (company_id, reporting_year, status, submitted_by)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [companyId, reportingYear, status, submittedBy]
        );

        return result.rows[0];
    },

    async getDisclosure(id) {
        const result = await db.query(
            `SELECT * FROM disclosures
             WHERE id = $1`,
            [id]
        );

        return result.rows[0];
    },

    async getDisclosures() {
        const result = await db.query(
            `SELECT * FROM disclosures
             ORDER BY created_at DESC`
        );

        return result.rows;
    },

    async updateDisclosure(id, data) {
        const result = await db.query(
            `UPDATE disclosures
             SET reporting_year = $1,
                 status = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [
                data.reportingYear,
                data.status,
                id
            ]
        );

        return result.rows[0] || null;
    },

    async deleteDisclosure(id) {
        const result = await db.query(
            `DELETE FROM disclosures
             WHERE id = $1`,
            [id]
        );

        return result.rowCount > 0;
    },

    async updateStatus(id, status) {
    const result = await db.query(
        `UPDATE disclosures
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [status, id]
    );

    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0];
}
};