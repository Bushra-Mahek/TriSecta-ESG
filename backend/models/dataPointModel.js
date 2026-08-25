import { db } from "../config/db.js";

export const dataPointModel = {

    async createDataPoint(
    disclosureId,
    metricId,
    value,
    unit,
    periodStart,
    periodEnd,
    hash,
    enteredBy,
    client = db
) {
    const result = await client.query(
        `INSERT INTO data_points
        (
            disclosure_id,
            metric_id,
            value,
            unit,
            period_start,
            period_end,
            hash,
            entered_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
            disclosureId,
            metricId,
            value,
            unit,
            periodStart,
            periodEnd,
            hash,
            enteredBy
        ]
    );

    return result.rows[0];
},

async getDataPoint(id) {
    const result = await db.query(
        `SELECT *
         FROM data_points
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
},

async getDataPointsByDisclosure(disclosureId) {
    const result = await db.query(
        `SELECT *
         FROM data_points
         WHERE disclosure_id = $1
         ORDER BY period_start ASC`,
        [disclosureId]
    );

    return result.rows;
},

async updateDataPoint(
    id,
    data,
    hash,
    client = db
) {
    const result = await client.query(
        `UPDATE data_points
         SET value = $1,
             unit = $2,
             period_start = $3,
             period_end = $4,
             hash = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [
            data.value,
            data.unit,
            data.periodStart,
            data.periodEnd,
            hash,
            id
        ]
    );

    return result.rows[0] || null;
},
};