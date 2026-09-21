import express from "express";

import { dashboardController }
    from "../controllers/dashboardController.js";

import { authenticate }
    from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    dashboardController.getDashboard
);

export default router;