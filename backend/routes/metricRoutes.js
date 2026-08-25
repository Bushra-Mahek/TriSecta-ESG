import express from "express";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

import {
    createMetric,
    getMetric,
    getMetrics,
    updateMetric,
    deactivateMetric
} from "../controllers/metricController.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getMetrics
);

router.get(
    "/:id",
    authenticate,
    getMetric
);

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createMetric
);

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    updateMetric
);

router.patch(
    "/:id/deactivate",
    authenticate,
    authorize("ADMIN"),
    deactivateMetric
);

export default router;