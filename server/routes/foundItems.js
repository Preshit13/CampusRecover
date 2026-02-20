import express from "express";
import { getDB } from "../db/database.js";
import { ObjectId } from "mongodb";
import { findMatches } from "../utils/matchingAlgorithm.js";

const router = express.Router();

// GET all found items (with pagination, filters, and smart sorting)
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { category, location, page = 1, limit = 18 } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (location) filter.locationFound = new RegExp(location, "i");

    // Count total matching items
    const totalItems = await db.collection("found_items").countDocuments(filter);

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Fetch all matching items (for sorting)
    let items = await db.collection("found_items").find(filter).toArray();

    // Sort: unclaimed first (newest), then claimed (newest)
    items.sort((a, b) => {
      if (a.status === "unclaimed" && b.status === "claimed") return -1;
      if (a.status === "claimed" && b.status === "unclaimed") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Apply pagination after sorting
    const paginatedItems = items.slice(skip, skip + limitNum);

    res.json({
      items: paginatedItems,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single found item by ID
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const item = await db.collection("found_items").findOne({ _id: new ObjectId(req.params.id) });

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new found item
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const newItem = {
      itemName: req.body.itemName,
      category: req.body.category,
      description: req.body.description,
      locationFound: req.body.locationFound,
      currentLocation: req.body.currentLocation,
      dateTime: new Date(req.body.dateTime || Date.now()),
      contactInfo: req.body.contactInfo,
      status: req.body.status || "unclaimed",
      createdAt: new Date(),
    };

    const result = await db.collection("found_items").insertOne(newItem);
    res.status(201).json({ ...newItem, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update found item
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const updateData = {
      itemName: req.body.itemName,
      category: req.body.category,
      description: req.body.description,
      locationFound: req.body.locationFound,
      currentLocation: req.body.currentLocation,
      dateTime: new Date(req.body.dateTime),
      contactInfo: req.body.contactInfo,
      status: req.body.status,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("found_items")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    if (result.matchedCount === 0) return res.status(404).json({ error: "Item not found" });

    res.json({ message: "Item updated", ...updateData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH mark as claimed
router.patch("/:id/status", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("found_items")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: req.body.status, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) return res.status(404).json({ error: "Item not found" });

    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE found item
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("found_items")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) return res.status(404).json({ error: "Item not found" });

    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET matches for a found item
router.get("/:id/matches", async (req, res) => {
  try {
    const db = getDB();
    const foundItem = await db
      .collection("found_items")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!foundItem) return res.status(404).json({ error: "Item not found" });

    const lostItems = await db.collection("lost_items").find({}).toArray();
    const matches = findMatches(foundItem, lostItems);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
