import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./server/db/database.js";
import lostItemsRoutes from "./server/routes/lostItems.js";
import analyticsRoutes from "./server/routes/analytics.js";
import foundItemsRoutes from "./server/routes/foundItems.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API is working!" });
});

// Lost items routes
app.use("/api/lost-items", lostItemsRoutes);

// Analytics routes
app.use("/api/analytics", analyticsRoutes);

app.use("/api/found-items", foundItemsRoutes);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});
