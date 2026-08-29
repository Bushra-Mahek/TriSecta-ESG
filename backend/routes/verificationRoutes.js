import express from "express";

import {
    verifyDisclosure,
    rejectDisclosure
} from "../controllers/verificationController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.patch(
    "/:id/verify",
    authenticate,
    verifyDisclosure
);


router.patch(
    "/:id/reject",
    authenticate,
    rejectDisclosure
);


export default router;