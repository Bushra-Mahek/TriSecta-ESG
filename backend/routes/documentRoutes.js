import express from "express";

import { authenticate } from "../middlewares/authMiddleware.js";

import {
    createDocument,
    getDocument,
    getDocumentsByDisclosure
} from "../controllers/documentController.js";

const router = express.Router();


router.post(
    "/",
    authenticate,
    createDocument
);


router.get(
    "/:id",
    authenticate,
    getDocument
);


router.get(
    "/disclosure/:disclosureId",
    authenticate,
    getDocumentsByDisclosure
);


export default router;