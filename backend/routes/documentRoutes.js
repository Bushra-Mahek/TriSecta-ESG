import express from "express";

import { authenticate } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

import {
    createDocument,
    getDocument,
    getDocumentsByDisclosure
} from "../controllers/documentController.js";

const router = express.Router();


router.post(
    "/",
    authenticate,
    upload.single("document"),
    createDocument
);

router.get(
    "/disclosure/:disclosureId",
    authenticate,
    getDocumentsByDisclosure
);

router.get(
    "/:id",
    authenticate,
    getDocument
);





export default router;