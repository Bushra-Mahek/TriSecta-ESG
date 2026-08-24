import { auditLogModel } from "../models/auditLogModel.js";

export const auditLogService = {

    async createLog(
        userId,
        action,
        entityType,
        entityId,
        ipAddress = null,
        client
    ) {
        return await auditLogModel.createLog(
            userId,
            action,
            entityType,
            entityId,
            ipAddress,
            client
        );
    },

    async getLogs() {
        return await auditLogModel.getLogs();
    }
};