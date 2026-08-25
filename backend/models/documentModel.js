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