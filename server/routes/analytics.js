import express from "express";
import { getDB } from "../db/database.js";

const router = express.Router();

// GET overall recovery statistics
router.get("/recovery-stats", async (req, res) => {
  try {
    const db = getDB();

    // Count total lost items
    const totalLost = await db.collection("lost_items").countDocuments();

    // Count recovered items
    const totalRecovered = await db
      .collection("lost_items")
      .countDocuments({ status: "recovered" });

    // Count active items
    const totalActive = await db
      .collection("lost_items")
      .countDocuments({ status: "active" });

    // Calculate recovery rate
    const recoveryRate =
      totalLost > 0 ? ((totalRecovered / totalLost) * 100).toFixed(1) : 0;

    res.json({
      totalLost,
      totalRecovered,
      totalActive,
      recoveryRate: parseFloat(recoveryRate),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET common loss locations
router.get("/common-locations", async (req, res) => {
  try {
    const db = getDB();

    const locations = await db
      .collection("lost_items")
      .aggregate([
        {
          $group: {
            _id: "$location",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 0,
            location: "$_id",
            count: 1,
          },
        },
      ])
      .toArray();

    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET most frequently lost item types
router.get("/item-types", async (req, res) => {
  try {
    const db = getDB();

    const itemTypes = await db
      .collection("lost_items")
      .aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            count: 1,
          },
        },
      ])
      .toArray();

    res.json(itemTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET recovery rate by category
router.get("/recovery-by-category", async (req, res) => {
  try {
    const db = getDB();

    const recoveryByCategory = await db
      .collection("lost_items")
      .aggregate([
        {
          $group: {
            _id: "$category",
            total: { $sum: 1 },
            recovered: {
              $sum: {
                $cond: [{ $eq: ["$status", "recovered"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            total: 1,
            recovered: 1,
            recoveryRate: {
              $cond: [
                { $eq: ["$total", 0] },
                0,
                { $multiply: [{ $divide: ["$recovered", "$total"] }, 100] },
              ],
            },
          },
        },
        {
          $sort: { recoveryRate: -1 },
        },
      ])
      .toArray();

    res.json(recoveryByCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
