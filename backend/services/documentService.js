import { documentModel } from "../models/documentModel.js";
import { disclosureModel } from "../models/disclosureModel.js";
import { auditLogModel } from "../models/auditLogModel.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { transaction } from "../config/db.js";

export const documentService = {

    async createDocument(
        data,
        user,
        ipAddress
    ) {

        if (user.role !== "COMPANY_USER") {
            throw new AppError(
                "Access denied",
                403
            );
        }

        const disclosure =
            await disclosureModel.getDisclosure(
                data.disclosureId
            );

        if (!disclosure) {
            throw new AppError(
                "Disclosure not found",
                404
            );
        }

        if (
            disclosure.company_id !== user.company_id
        ) {
            throw new AppError(
                "Access denied",
                403
            );
        }

        if (disclosure.status !== "DRAFT") {
            throw new AppError(
                "Documents can only be uploaded for draft disclosures",
                409
            );
        }

        if (
            !data.fileName ||
            !data.fileType ||
            !data.fileUrl
        ) {
            throw new AppError(
                "File name, file type and file URL are required",
                400
            );
        }

        return await transaction(async (client) => {

            const document =
                await documentModel.createDocument(
                    data.disclosureId,
                    user.id,
                    data.fileName,
                    data.fileType,
                    data.fileUrl,
                    client
                );

            await auditLogModel.createLog(
                user.id,
                "UPLOAD_DOCUMENT",
                "DOCUMENT",
                document.id,
                ipAddress,
                client
            );

            return document;
        });
    },


    async getDocument(id, user) {

        const document =
            await documentModel.getDocument(id);

        if (!document) {
            throw new AppError(
                "Document not found",
                404
            );
        }

        const disclosure =
            await disclosureModel.getDisclosure(
                document.disclosure_id
            );

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

        return document;
    },


    async getDocumentsByDisclosure(
        disclosureId,
        user
    ) {

        const disclosure =
            await disclosureModel.getDisclosure(
                disclosureId
            );

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

        return await documentModel
            .getDocumentsByDisclosure(
                disclosureId
            );
    }

};