import { db } from "../config/db.js";

export const validationResultModel = {

    async createResults(
        disclosureId,
        results,
        client = db
    ) {

        if (!results || results.length === 0) {
            return [];
        }

        const created = [];

        for (const result of results) {

            const queryResult = await client.query(
                `INSERT INTO validation_results
                (
                    disclosure_id,
                    rule_code,
                    category,
                    severity,
                    status,
                    message,
                    expected,
                    actual
                )
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [
                    disclosureId,
                    result.ruleCode,
                    result.category,
                    result.severity,
                    result.status,
                    result.message,
                    result.expected ?? null,
                    result.actual ?? null
                ]
            );

            created.push(queryResult.rows[0]);
        }

        return created;
    },


    async getResultsByDisclosure(
        disclosureId,
        client = db
    ) {

        const result = await client.query(
            `SELECT *
             FROM validation_results
             WHERE disclosure_id = $1
             ORDER BY created_at ASC`,
            [disclosureId]
        );

        return result.rows;
    },


    async deleteResultsByDisclosure(
        disclosureId,
        client = db
    ) {

        await client.query(
            `DELETE FROM validation_results
             WHERE disclosure_id = $1`,
            [disclosureId]
        );
    }

};