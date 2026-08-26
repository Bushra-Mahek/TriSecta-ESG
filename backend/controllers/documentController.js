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
                req.file,
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