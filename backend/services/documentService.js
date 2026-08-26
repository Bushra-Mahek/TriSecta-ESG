import { documentModel } from "../models/documentModel.js";
import { disclosureModel } from "../models/disclosureModel.js";
import { auditLogModel } from "../models/auditLogModel.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { transaction } from "../config/db.js";

import s3 from "../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import crypto from "crypto";

export const documentService = {

    async createDocument(data, user, file, ipAddress) {

        if (!file) {
            throw new AppError(
                "Document file is required",
                400
            );
        }

        const disclosure =
            await disclosureModel.getDisclosure(data.disclosureId);

        if (!disclosure) {
            throw new AppError(
                "Disclosure not found",
                404
            );
        }

        // Only the company owning the disclosure can upload
        if (
            user.role !== "COMPANY_USER" ||
            disclosure.company_id !== user.company_id
        ) {
            throw new AppError(
                "Access denied",
                403
            );
        }

        // Documents can only be modified while draft
        if (disclosure.status !== "DRAFT") {
            throw new AppError(
                "Documents can only be uploaded for draft disclosures",
                409
            );
        }

        const documentId = crypto.randomUUID();

        const key =
            `disclosures/${disclosure.id}/documents/${documentId}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            })
        );

        return await transaction(async (client) => {

            const document =
                await documentModel.createDocument(
                    disclosure.id,
                    user.id,
                    file.originalname,
                    file.mimetype,
                    key,
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