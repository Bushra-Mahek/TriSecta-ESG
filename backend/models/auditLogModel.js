import { db } from "../config/db.js";

export const auditLogModel = {

    async createLog(
        userId,
        action,
        entityType,
        entityId,
        ipAddress = null,
        client = db
    ) {

        const result = await client.query(
            `INSERT INTO audit_logs
                (
                    user_id,
                    action,
                    entity_type,
                    entity_id,
                    ip_address
                )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                userId,
                action,
                entityType,
                entityId,
                ipAddress
            ]
        );

        return result.rows[0];
    },

    async getLogs() {

        const result = await db.query(
            `SELECT *
             FROM audit_logs
             ORDER BY created_at DESC`
        );

        return result.rows;
    }
};

