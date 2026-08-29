import { disclosureModel } from "../models/disclosureModel.js";
import { dataPointModel } from "../models/dataPointModel.js";
import { documentModel } from "../models/documentModel.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import {
    canTransition
} from "../utils/disclosureTransitions.js";
import { transaction } from "../config/db.js";
import { disclosureAuditModel } from "../models/disclosureAuditModel.js";
import { auditLogModel } from "../models/auditLogModel.js";

import { merkleService } from "./merkleService.js";
import { blockchainService } from "./blockchainService.js";

import { merkleModel } from "../models/merkleModel.js";
import { blockchainTransactionModel } from "../models/blockchainTransactionModel.js";
import { validationService }
    from "./validation/validationService.js";
    import { validationResultModel }
    from "../models/validationResultModel.js";

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

async submitDisclosure(id, user,ipAddress) {

    // --------------------------------
    // 1. Authorization
    // --------------------------------

    if (user.role !== "COMPANY_USER") {
        throw new AppError(
            "Access denied",
            403
        );
    }


    // --------------------------------
    // 2. Fetch disclosure
    // --------------------------------

    const disclosure =
        await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }


    // --------------------------------
    // 3. Ownership
    // --------------------------------

    if (
        disclosure.company_id !==
        user.company_id
    ) {
        throw new AppError(
            "Access denied",
            403
        );
    }


    // --------------------------------
    // 4. Validate transition
    // --------------------------------

    if (!canTransition(
        disclosure.status,
        "UNDER_REVIEW"
    )) {
        throw new AppError(
            "Invalid disclosure status transition",
            409
        );
    }


    // --------------------------------
    // 5. Get ESG data
    // --------------------------------

    
// 5. FULL VALIDATION
// --------------------------------

const validation =
    await validationService
        .validateDisclosure(id);


if (!validation.valid) {

    throw new AppError(
        "Disclosure failed automated validation",
        409
    );
}
const dataPoints =
    await dataPointModel
        .getDataPointsByDisclosure(id);

if (
    !dataPoints ||
    dataPoints.length === 0
) {
    throw new AppError(
        "Cannot submit disclosure without data points",
        409
    );
}


    // --------------------------------
    // 6. Convert DB records into
    //    canonical Merkle records
    // --------------------------------

    const records =
        dataPoints.map(dataPoint => ({
            disclosureId:
                dataPoint.disclosure_id,

            metricId:
                dataPoint.metric_id,

            value:
                dataPoint.value,

            unit:
                dataPoint.unit,

            periodStart:
                dataPoint.period_start,

            periodEnd:
                dataPoint.period_end,

            enteredBy:
                dataPoint.entered_by
        }));


    // --------------------------------
    // 7. Build Merkle tree
    // --------------------------------

    const {
        leafHashes,
        root
    } = merkleService.buildTree(
        records
    );


    // Solidity bytes32 requires 0x prefix
    const merkleRoot =
        `0x${root}`;


    // --------------------------------
    // 8. Prevent duplicate DB anchoring
    // --------------------------------

    const existingRoot =
        await merkleModel
            .getByDisclosureAndRoot(
                id,
                root
            );

    if (existingRoot) {

        throw new AppError(
            "This disclosure version is already anchored",
            409
        );
    }


    // --------------------------------
    // 9. Anchor on Sepolia
    // --------------------------------

    const blockchainResult =
        await blockchainService
            .anchorMerkleRoot(
                merkleRoot
            );


    // --------------------------------
    // 10. Save everything in PostgreSQL
    // --------------------------------

    return await transaction(
        async (client) => {

            const anchoredAt =
                blockchainResult.timestamp
                    ? new Date(
                        Number(
                            blockchainResult.timestamp
                        ) * 1000
                    )
                    : new Date();


            const merkleRootRecord =
                await merkleModel.create(
                    id,
                    root,
                    "SEPOLIA",
                    blockchainResult.transactionHash,
                    blockchainResult.blockNumber,
                    anchoredAt,
                    client
                );


            if (
                blockchainResult.transactionHash
            ) {

                await blockchainTransactionModel
                    .create(
                        id,
                        blockchainResult.transactionHash,
                        blockchainResult.blockNumber,
                        blockchainResult.gasUsed,
                        "CONFIRMED",
                        client
                    );
            }


            // --------------------------------
            // 11. Change disclosure status
            // --------------------------------

            const updatedDisclosure =
                await disclosureModel.updateStatus(
                    id,
                    "UNDER_REVIEW",
                    client
                );


            // --------------------------------
            // 12. Disclosure audit trail
            // --------------------------------

            await disclosureAuditModel.createLog(
                id,
                user.id,
                "SUBMITTED",
                disclosure.status,
                "UNDER_REVIEW",
                client
            );


            // --------------------------------
            // 13. General audit log
            // --------------------------------

            await auditLogModel.createLog(
                user.id,
                "SUBMIT_DISCLOSURE",
                "DISCLOSURE",
                id,
                ipAddress,
                client
            );


            return {
                disclosure:
                    updatedDisclosure,

                merkleRoot:
                    merkleRoot,

                leafCount:
                    leafHashes.length,

                blockchain:
                    blockchainResult,

                merkleRootRecord
            };
        }
    );
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
},

async getDisclosureReview(id, user) {

    const disclosure =
        await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    // Draft disclosures are private to the owning company
    if (
        disclosure.status === "DRAFT" &&
        (
            user.role !== "COMPANY_USER" ||
            disclosure.company_id !== user.company_id
        )
    ) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    // Company users can only see their own company's disclosure
    if (
        user.role === "COMPANY_USER" &&
        disclosure.company_id !== user.company_id
    ) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    const dataPoints =
        await dataPointModel
            .getDataPointsByDisclosure(id);

    const documents =
        await documentModel
            .getDocumentsByDisclosure(id);

    const validationResults =
        await validationResultModel
            .getResultsByDisclosure(id);

    return {
        disclosure,
        dataPoints,
        documents,
        validationResults
    };
},

async getPendingReviews(user) {

    if (user.role !== "AUDITOR") {
        throw new AppError(
            "Access denied",
            403
        );
    }

    return await disclosureModel.getPendingReviews();
},

async getDisclosureTimeline(id, user) {

    const disclosure =
        await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    // Draft disclosures are private to owning company
    if (
        disclosure.status === "DRAFT" &&
        (
            user.role !== "COMPANY_USER" ||
            disclosure.company_id !== user.company_id
        )
    ) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    // Company users can only view their own disclosures
    if (
        user.role === "COMPANY_USER" &&
        disclosure.company_id !== user.company_id
    ) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    return await disclosureModel.getDisclosureTimeline(id);
},

};