// scripts/createQuestionIndex.cjs

require("dotenv").config({ path: ".env.local" }); // <-- IMPORTANT

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Check .env.local");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  const coll = db.collection("questions");

  await coll.createIndex(
    { category: 1, text: 1 },
    { unique: true, name: "unique_category_text" }
  );

  console.log("Index created successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
