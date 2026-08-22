import express from "express";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies",companyRoutes);

export default app;