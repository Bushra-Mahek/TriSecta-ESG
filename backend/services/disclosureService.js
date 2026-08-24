import { disclosureModel } from "../models/disclosureModel.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import {
    canTransition
} from "../utils/disclosureTransitions.js";
import { transaction } from "../config/db.js";
import { disclosureAuditModel } from "../models/disclosureAuditModel.js";
import { auditLogModel } from "../models/auditLogModel.js";

export const disclosureService = {
    async createDisclosure(reportingYear, user, ipAddress) {

    const companyId = user.company_id;
    const submittedBy = user.id;
    const status = "DRAFT";

    return await transaction(async (client) => {

        const disclosure =
            await disclosureModel.createDisclosure(
                companyId,
                reportingYear,
                status,
                submittedBy,
                client
            );

        await auditLogModel.createLog(
            user.id,
            "CREATE_DISCLOSURE",
            "DISCLOSURE",
            disclosure.id,
            ipAddress,
            client
        );

        return disclosure;
    });
},

    async getDisclosure(id,user){
        const disclosure = await disclosureModel.getDisclosure(id);
        if(!disclosure){
             throw new AppError("Disclosure not found", 404);
        }

        if(user.role === "COMPANY_USER" && disclosure.company_id  !== user.company_id){
            throw new AppError("Access denied", 403);
        }
        
        return disclosure;
    },

    async getDisclosures(){
        const ds = await disclosureModel.getDisclosures();
        return ds;
    },

    async updateDisclosure(id, data, user, ipAddress) {

    const disclosure = await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    if (
        user.role === "COMPANY_USER" &&
        disclosure.company_id !== user.company_id
    ) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    if (disclosure.status !== "DRAFT") {
        throw new AppError(
            "Only draft disclosures can be updated",
            409
        );
    }

    const forbiddenFields = [
        "status",
        "companyId",
        "company_id",
        "submittedBy",
        "submitted_by"
    ];

    for (const field of forbiddenFields) {
        if (data[field] !== undefined) {
            throw new AppError(
                `${field} cannot be modified directly`,
                400
            );
        }
    }

    const allowedData = {};

    if (data.reportingYear !== undefined) {
        allowedData.reportingYear = data.reportingYear;
    }

    if (Object.keys(allowedData).length === 0) {
    throw new AppError(
        "No valid fields provided for update",
        400
    );
    }

    return await transaction(async (client) => {

        const updatedDisclosure =
            await disclosureModel.updateDisclosure(
                id,
                allowedData,
                client
            );

        await auditLogModel.createLog(
            user.id,
            "UPDATE_DISCLOSURE",
            "DISCLOSURE",
            id,
            ipAddress,
            client
        );

        return updatedDisclosure;
    });
},

    async deleteDisclosure(id, user, ipAddress) {

    const disclosure = await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    if (
        user.role === "COMPANY_USER" &&
        disclosure.company_id !== user.company_id
    ) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    if (disclosure.status !== "DRAFT") {
        throw new AppError(
            "Only draft disclosures can be deleted",
            409
        );
    }

    return await transaction(async (client) => {

        const deleted =
            await disclosureModel.deleteDisclosure(
                id,
                client
            );

        await auditLogModel.createLog(
            user.id,
            "DELETE_DISCLOSURE",
            "DISCLOSURE",
            id,
            ipAddress,
            client
        );

        return deleted;
    });
},


    async reviseDisclosure(id, user) {

    const disclosure = await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    if (user.role !== "COMPANY_USER") {
        throw new AppError(
            "Access denied",
            403
        );
    }

    if (disclosure.company_id !== user.company_id) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    if (!canTransition(
        disclosure.status,
        "DRAFT"
    )) {
        throw new AppError(
            "Invalid disclosure status transition",
            409
        );
    }

    return await transaction(async (client) => {

        const updatedDisclosure =
            await disclosureModel.updateStatus(
                id,
                "DRAFT",
                client
            );

        await disclosureAuditModel.createLog(
            id,
            user.id,
            "REVISED",
            disclosure.status,
            "DRAFT",
            client
        );

        return updatedDisclosure;
    });
},

async submitDisclosure(id, user) {

    const disclosure = await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    if (user.role !== "COMPANY_USER") {
    throw new AppError(
        "Access denied",
        403
    );
}

    if (disclosure.company_id !== user.company_id) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    if (!canTransition(
        disclosure.status,
        "UNDER_REVIEW"
    )) {
        throw new AppError(
            "Invalid disclosure status transition",
            409
        );
    }

    return await transaction(async (client) => {

        const updatedDisclosure =
            await disclosureModel.updateStatus(
                id,
                "UNDER_REVIEW",
                client
            );

        await disclosureAuditModel.createLog(
            id,
            user.id,
            "SUBMITTED",
            disclosure.status,
            "UNDER_REVIEW",
            client
        );

        return updatedDisclosure;
    });
},



async verifyDisclosure(id, user) {

    // 1. Authorization FIRST
    if (user.role !== "AUDITOR") {
        throw new AppError(
            "Access denied",
            403
        );
    }

    // 2. Fetch disclosure
    const disclosure = await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    // 3. Validate state transition
    if (!canTransition(disclosure.status, "VERIFIED")) {
        throw new AppError(
            "Invalid disclosure status transition",
            409
        );
    }

    // 4. Perform status update + audit log atomically
    return await transaction(async (client) => {

        const updatedDisclosure =
            await disclosureModel.updateStatus(
                id,
                "VERIFIED",
                client
            );

        await disclosureAuditModel.createLog(
            id,
            user.id,
            "VERIFIED",
            disclosure.status,
            "VERIFIED",
            client
        );

        return updatedDisclosure;
    });
},

async rejectDisclosure(id, user) {

    if (user.role !== "AUDITOR") {
        throw new AppError(
            "Access denied",
            403
        );
    }

    const disclosure =
        await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    if (!canTransition(
        disclosure.status,
        "REJECTED"
    )) {
        throw new AppError(
            "Invalid disclosure status transition",
            409
        );
    }

    return await transaction(async (client) => {

        const updatedDisclosure =
            await disclosureModel.updateStatus(
                id,
                "REJECTED",
                client
            );

        await disclosureAuditModel.createLog(
            id,
            user.id,
            "REJECTED",
            disclosure.status,
            "REJECTED",
            client
        );

        return updatedDisclosure;
    });
}

};