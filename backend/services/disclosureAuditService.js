import { disclosureAuditModel } from "../models/disclosureAuditModel.js";

export const disclosureAuditService = {

    async createLog(
        disclosureId,
        actorId,
        action,
        oldStatus,
        newStatus
    ) {
        return await disclosureAuditModel.createLog(
            disclosureId,
            actorId,
            action,
            oldStatus,
            newStatus
        );
    },

    async getHistory(disclosureId) {
        return await disclosureAuditModel.getHistory(disclosureId);
    }
};