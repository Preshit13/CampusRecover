import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const categories = ["Electronics", "Accessories", "Clothing", "Books", "IDs", "Keys", "Other"];
const locations = [
  "Snell Library 1st floor",
  "Snell Library 2nd floor",
  "Snell Library 3rd floor",
  "Curry Student Center",
  "Marino Recreation Center",
  "ISEC Building",
  "Ryder Hall",
  "Dodge Hall",
  "Richards Hall",
  "Ell Hall",
  "Forsyth Building",
  "Hurtig Hall",
  "Nightingale Hall",
  "West Village dining",
  "IV dining hall",
];

const itemNames = {
  Electronics: [
    "iPhone",
    "MacBook Pro",
    "AirPods",
    "iPad",
    "Apple Watch",
    "Charger",
    "Laptop",
    "Headphones",
    "Phone Case",
  ],
  Accessories: [
    "Wallet",
    "Backpack",
    "Water Bottle",
    "Umbrella",
    "Sunglasses",
    "Watch",
    "Bracelet",
    "Necklace",
    "Ring",
  ],
  Clothing: ["Jacket", "Hoodie", "Scarf", "Gloves", "Hat", "Sweater", "Coat", "Shoes"],
  Books: ["Textbook", "Notebook", "Novel", "Planner", "Binder", "Calculator"],
  IDs: ["Student ID", "Driver License", "Credit Card", "Husky Card", "Passport"],
  Keys: ["Dorm Keys", "Car Keys", "Bike Lock Key", "Room Key", "Mailbox Key"],
  Other: ["Phone Charger", "USB Drive", "Earbuds", "Folder", "Pen", "Lunchbox"],
};

const descriptions = [
  "Black color with some wear",
  "Silver/gray, slightly damaged",
  "Blue with stickers",
  "Red with keychain attached",
  "Brand new condition",
  "Well-used, has scratches",
  "Navy blue, small dent",
  "White with case",
  "Contains personal items",
  "Has owner name written on it",
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("campusrecover");

    // Clear existing data (optional - remove if you want to keep current data)
    // await db.collection('lost_items').deleteMany({});
    // await db.collection('found_items').deleteMany({});
    // console.log('🗑️  Cleared existing data');

    const lostItems = [];
    const foundItems = [];

    // Generate 600 lost items
    console.log("📦 Generating 600 lost items...");
    for (let i = 0; i < 600; i++) {
      const category = randomElement(categories);
      const itemName = randomElement(itemNames[category]);
      const location = randomElement(locations);
      const dateTime = randomDate(30); // Within last 30 days
      const status = Math.random() > 0.3 ? "active" : "recovered"; // 70% active, 30% recovered

      lostItems.push({
        itemName,
        category,
        description: `${itemName} - ${randomElement(descriptions)}`,
        location,
        dateTime,
        contactInfo: `student${i}@northeastern.edu`,
        status,
        createdAt: dateTime,
      });
    }

    // Generate 400 found items
    console.log("📦 Generating 400 found items...");
    for (let i = 0; i < 400; i++) {
      const category = randomElement(categories);
      const itemName = randomElement(itemNames[category]);
      const locationFound = randomElement(locations);
      const currentLocation = Math.random() > 0.5 ? "NUPD Lost & Found" : locationFound;
      const dateTime = randomDate(30);
      const status = Math.random() > 0.25 ? "unclaimed" : "claimed"; // 75% unclaimed, 25% claimed

      foundItems.push({
        itemName,
        category,
        description: `${itemName} - ${randomElement(descriptions)}`,
        locationFound,
        currentLocation,
        dateTime,
        contactInfo: `finder${i}@northeastern.edu`,
        status,
        createdAt: dateTime,
      });
    }

    // Insert lost items
    console.log("💾 Inserting lost items...");
    const lostResult = await db.collection("lost_items").insertMany(lostItems);
    console.log(`✅ Inserted ${lostResult.insertedCount} lost items`);

    // Insert found items
    console.log("💾 Inserting found items...");
    const foundResult = await db.collection("found_items").insertMany(foundItems);
    console.log(`✅ Inserted ${foundResult.insertedCount} found items`);

    // Verify counts
    const lostCount = await db.collection("lost_items").countDocuments();
    const foundCount = await db.collection("found_items").countDocuments();

    console.log("\n📊 Database Summary:");
    console.log(`   Lost Items: ${lostCount}`);
    console.log(`   Found Items: ${foundCount}`);
    console.log(`   Total Records: ${lostCount + foundCount}`);

    if (lostCount + foundCount >= 1000) {
      console.log("\n🎉 SUCCESS! Database has 1000+ records!");
    } else {
      console.log("\n⚠️  Warning: Less than 1000 records");
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.close();
    console.log("\n✅ Database connection closed");
  }
}

// Run the seed function
seedDatabase();
