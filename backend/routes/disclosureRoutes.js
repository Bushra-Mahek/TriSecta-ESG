import express from "express"
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import { createDisclosure, viewDisclosure, viewDisclosures, updateDisclosure, deleteDisclosure, reviseDisclosure, submitDisclosure,  verifyDisclosure,
    rejectDisclosure } from "../controllers/disclosureController.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("COMPANY_USER"),
    createDisclosure
);

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "AUDITOR", "REGULATOR"),
    viewDisclosures
);

router.get(
    "/:id",
    authenticate,
    viewDisclosure
);

router.put(
    "/:id",
    authenticate,
    authorize("COMPANY_USER"),
    updateDisclosure
);

router.delete(
    "/:id",
    authenticate,
    authorize("COMPANY_USER"),
    deleteDisclosure
);

router.post(
    "/:id/revise",
    authenticate,
    authorize("COMPANY_USER"),
    reviseDisclosure
);

router.post(
    "/:id/submit",
    authenticate,
    authorize("COMPANY_USER"),
    submitDisclosure
);

router.post(
    "/:id/verify",
    authenticate,
    authorize("AUDITOR"),
    verifyDisclosure
);

router.post(
    "/:id/reject",
    authenticate,
    authorize("AUDITOR"),
    rejectDisclosure
);

export default router;

