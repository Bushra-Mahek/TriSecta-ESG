import { db } from "../config/db.js";


export const verificationResultModel = {

    async createVerification(
        disclosureId,
        verificationStatus,
        verifiedBy,
        verificationNotes,
        client = db
    ) {

        const result = await client.query(
            `INSERT INTO verification_results
            (
                disclosure_id,
                verification_status,
                verified_by,
                verification_notes,
                verified_at
            )
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
                disclosureId,
                verificationStatus,
                verifiedBy,
                verificationNotes
            ]
        );

        return result.rows[0];
    },


    async getVerificationByDisclosure(
        disclosureId
    ) {

        const result = await db.query(
            `SELECT *
             FROM verification_results
             WHERE disclosure_id = $1
             ORDER BY verified_at DESC`,
            [disclosureId]
        );

        return result.rows;
    }

};