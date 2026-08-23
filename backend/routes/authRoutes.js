console.log("🔥 AUTH ROUTES FILE LOADED");
import express from "express";
import { register,login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", (req, res, next) => {
    console.log("🔥 REGISTER ROUTE HIT");
    register(req, res, next);
});
router.post("/login",login);
export default router;
