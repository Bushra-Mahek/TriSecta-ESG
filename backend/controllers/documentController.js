import { db } from "../config/db.js";

export const documentModel = {

    async createDocument(
        disclosureId,
        uploadedBy,
        fileName,
        fileType,
        fileUrl,
        client = db
    ) {

        const result = await client.query(
            `INSERT INTO documents
            (
                disclosure_id,
                uploaded_by,
                file_name,
                file_type,
                file_url
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                disclosureId,
                uploadedBy,
                fileName,
                fileType,
                fileUrl
            ]
        );

        return result.rows[0];
    },


    async getDocument(id) {

        const result = await db.query(
            `SELECT *
             FROM documents
             WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    },


    async getDocumentsByDisclosure(disclosureId) {

        const result = await db.query(
            `SELECT *
             FROM documents
             WHERE disclosure_id = $1
             ORDER BY uploaded_at DESC`,
            [disclosureId]
        );

        return result.rows;
    }

};

import { documentService } from "../services/documentService.js";


export const createDocument = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await documentService.createDocument(
                req.body,
                req.user,
                req.ip
            );

        return res.status(201).json({
            message: "Document uploaded successfully",
            document: result
        });

    } catch (err) {
        next(err);
    }
};


export const getDocument = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await documentService.getDocument(
                req.params.id,
                req.user
            );

        return res.status(200).json({
            document: result
        });

    } catch (err) {
        next(err);
    }
};


export const getDocumentsByDisclosure = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await documentService.getDocumentsByDisclosure(
                req.params.disclosureId,
                req.user
            );

        return res.status(200).json({
            documents: result
        });

    } catch (err) {
        next(err);
    }
};