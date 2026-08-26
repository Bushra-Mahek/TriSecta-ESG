import { db } from "../config/db.js";

export const disclosureModel = {

    async createDisclosure(
    companyId,
    reportingYear,
    status,
    submittedBy,
    client = db
) {
    const result = await client.query(
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

    async updateDisclosure(id, data, client = db) {
    const result = await client.query(
        `UPDATE disclosures
         SET reporting_year = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [
            data.reportingYear,
            id
        ]
    );

    return result.rows[0] || null;
},

    async deleteDisclosure(id,client = db) {
        const result = await client.query(
            `DELETE FROM disclosures
             WHERE id = $1`,
            [id]
        );

        return result.rowCount > 0;
    },

    async updateStatus(id, status, client = db) {

    const result = await client.query(
        `UPDATE disclosures
         SET status = $1::disclosure_status,

             submitted_at = CASE
                 WHEN $1::text = 'UNDER_REVIEW'
                 THEN CURRENT_TIMESTAMP
                 ELSE submitted_at
             END,

             verified_at = CASE
                 WHEN $1::text = 'VERIFIED'
                 THEN CURRENT_TIMESTAMP
                 ELSE verified_at
             END,

             rejected_at = CASE
                 WHEN $1::text = 'REJECTED'
                 THEN CURRENT_TIMESTAMP
                 ELSE rejected_at
             END,

             updated_at = CURRENT_TIMESTAMP

         WHERE id = $2
         RETURNING *`,
        [status, id]
    );

    return result.rows[0] || null;
},

async getPendingReviews() {
    const result = await db.query(
        `SELECT *
         FROM disclosures
         WHERE status = 'UNDER_REVIEW'
         ORDER BY submitted_at ASC`
    );

    return result.rows;
},

async getDisclosureTimeline(disclosureId) {
    const result = await db.query(
        `SELECT *
         FROM disclosure_audit_logs
         WHERE disclosure_id = $1
         ORDER BY created_at ASC`,
        [disclosureId]
    );

    return result.rows;
},
};