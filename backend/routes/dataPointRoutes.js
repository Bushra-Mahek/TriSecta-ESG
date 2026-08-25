import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
    createDataPoint,getDataPoint, getDataPointsByDisclosure, updateDataPoint
} from "../controllers/dataPointController.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("COMPANY_USER"),
    createDataPoint
);

router.get("/:id",authenticate,getDataPoint);
router.get(
    "/disclosure/:disclosureId",
    authenticate,
    getDataPointsByDisclosure
);

router.put(
    "/:id",
    authenticate,
    authorize("COMPANY_USER"),
    updateDataPoint
);

export default router;