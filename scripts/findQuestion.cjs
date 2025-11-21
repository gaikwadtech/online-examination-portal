// scripts/findQuestion.cjs
require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing in .env.local");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(); // uses DB from URI
  console.log("Connected DB:", db.databaseName);

  const collNames = await db.listCollections().toArray();
  console.log("Collections:", collNames.map(c => c.name));

  const coll = db.collection('questions');

  const id = process.argv[2];
  if (!id) {
    const doc = await coll.findOne({}, { sort: { createdAt: -1 } });
    console.log('Latest question (or null):', doc);
  } else {
    try {
      const doc = await coll.findOne({ _id: new ObjectId(id) });
      console.log('Found by id:', doc);
    } catch (err) {
      console.error('Invalid id or error:', err.message);
    }
  }

  await client.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
