import { db } from "../config/db.js";

export const disclosureAuditModel = {

    async createLog(
        disclosureId,
        actorId,
        action,
        oldStatus,
        newStatus,
        client = db
    ) {

        const result = await client.query(
            `INSERT INTO disclosure_audit_logs
                (
                    disclosure_id,
                    actor_id,
                    action,
                    old_status,
                    new_status
                )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                disclosureId,
                actorId,
                action,
                oldStatus,
                newStatus
            ]
        );

        return result.rows[0];
    },

    async getHistory(disclosureId) {

        const result = await db.query(
            `SELECT
                dal.id,
                dal.action,
                dal.old_status,
                dal.new_status,
                dal.created_at,
                u.id AS actor_id,
                u.full_name AS actor_name,
                u.role AS actor_role
             FROM disclosure_audit_logs dal
             JOIN users u
                ON dal.actor_id = u.id
             WHERE dal.disclosure_id = $1
             ORDER BY dal.created_at ASC`,
            [disclosureId]
        );

        return result.rows;
    }
};