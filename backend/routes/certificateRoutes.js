import express from "express";
import { certificateController } from "../controllers/certificateController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
    "/:disclosureId",
    authenticate,
    certificateController.createCertificate
);

export default router;