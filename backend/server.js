const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

const MONGODB_URI = "mongodb+srv://arpitpepcoding_db_user:yk4gPm1Cz1dV9BEw@cluster0.c7j3uay.mongodb.net/?appName=Cluster0";
const APP_NAME = "MyShop";
const PORT = 3001;


const client = new MongoClient(MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const app = express();
app.use(cors());
app.use(express.json());

async function start() {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('Connected to MongoDB');

  const db = client.db('dummy');
  const products = db.collection('product');


  app.get('/api/products', async (_req, res) => {
    const all = await products.find().toArray();
    res.json(all);
  });

  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
