import { db } from "../config/db.js";

export const crossVerificationModel = {

    async createResult(
        data,
        client = db
    ) {

        const result = await client.query(
            `INSERT INTO cross_verification_results
            (
                disclosure_id,
                metric_id,
                company_value,
                external_value,
                unit,
                source_type,
                source_reference,
                verification_status,
                difference,
                tolerance,
                message
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *`,
            [
                data.disclosureId,
                data.metricId,
                data.companyValue,
                data.externalValue,
                data.unit,
                data.sourceType,
                data.sourceReference,
                data.verificationStatus,
                data.difference,
                data.tolerance,
                data.message
            ]
        );

        return result.rows[0];
    },


    async getResultsByDisclosure(disclosureId) {

        const result = await db.query(
            `SELECT *
             FROM cross_verification_results
             WHERE disclosure_id = $1
             ORDER BY created_at ASC`,
            [disclosureId]
        );

        return result.rows;
    }
};