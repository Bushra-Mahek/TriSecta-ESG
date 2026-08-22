import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import { createCompany, viewCompanies, viewCompany, updateCompany, deleteCompany } from "../controllers/companyController.js";

const router = express.Router();

router.post("/",authenticate, authorize("ADMIN"),createCompany);
router.get("/",authenticate,viewCompanies);
router.get("/:id", authenticate,viewCompany);
router.put("/:id",authenticate, authorize("ADMIN"),updateCompany);
router.delete("/:id",authenticate, authorize("ADMIN"), deleteCompany);

export default router;