// backend/src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

dotenv.config();

import "./config/db.mongo.js";
import "./config/db.postgres.js";

import authRoutes from "./routes/auth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contractorRoutes from "./routes/contractor.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

// ✅ Add proper CORS for Render frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000",                  // local dev
      "https://urbanmind-crowdsourced-civic-issue-u37h.onrender.com"      // 🔥 your Render frontend URL
    ],
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/uploads", express.static("uploads"));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/issue", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contractor", contractorRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("UrbanMind Backend Running...");
});

export default app;
