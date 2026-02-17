import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db;

export async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db("campusrecover");
    console.log("✅ MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
}
