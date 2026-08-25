import { db } from "../config/db.js";

export const metricModel = {

    async createMetric(
        metricName,
        metricCode,
        category,
        unit,
        description,
        client = db
    ) {
        const result = await client.query(
            `INSERT INTO metrics
            (
                metric_name,
                metric_code,
                category,
                unit,
                description
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                metricName,
                metricCode,
                category,
                unit,
                description
            ]
        );

        return result.rows[0];
    },

    async getMetric(id) {
        const result = await db.query(
            `SELECT *
             FROM metrics
             WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    },

    async getMetrics() {
    const result = await db.query(
        `SELECT *
         FROM metrics
         WHERE is_active = true
         ORDER BY created_at DESC`
    );

    return result.rows;
},

    async updateMetric(
        id,
        data,
        client = db
    ) {
        const result = await client.query(
            `UPDATE metrics
             SET metric_name = $1,
                 metric_code = $2,
                 category = $3,
                 unit = $4,
                 description = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [
                data.metricName,
                data.metricCode,
                data.category,
                data.unit,
                data.description,
                id
            ]
        );

        return result.rows[0] || null;
    },

    async deactivateMetric(id, client = db) {
        const result = await client.query(
            `UPDATE metrics
             SET is_active = false,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        return result.rows[0] || null;
    }
};