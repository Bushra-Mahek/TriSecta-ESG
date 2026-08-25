import express from "express";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import disclosureRoutes from "./routes/disclosureRoutes.js";
import metricRoutes from "./routes/metricRoutes.js";
import dataPointRoutes from "./routes/dataPointRoutes.js";


import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();
console.log("🔥 APP.JS LOADED");

app.use(express.json());

app.post("/debug-register", (req, res) => {
    console.log("🔥 DEBUG REGISTER HIT");
    res.json({ message: "POST route works" });
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies",companyRoutes);
app.use("/api/disclosures",disclosureRoutes);
app.use("/api/metrics", metricRoutes);
app.use("/api/data-points", dataPointRoutes);
app.use(errorHandler);

export default app;