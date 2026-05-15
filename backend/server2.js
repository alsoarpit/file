const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

const MONGODB_URI = "mongodb+srv://arpitpepcoding_db_user:yk4gPm1Cz1dV9BEw@cluster0.c7j3uay.mongodb.net/?appName=Cluster0";
const RAZORPAY_KEY_ID = "rzp_test_SpSxkUXmXpnQw3";
const RAZORPAY_KEY_SECRET = "Q3qlI9LlO8zmuAcpFW2Zinw8";
const APP_NAME = "MyShop";
const PORT = 3001;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

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
  const users = db.collection('users');
  const products = db.collection('product');
  const orders = db.collection('orders');

  await users.createIndex({ uid: 1 }, { unique: true });
  await orders.createIndex({ userEmail: 1, createdAt: -1 });

  const requireAuth = async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Missing token' });
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture };
      next();
    } catch (err) {
      console.error('Auth error:', err.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  app.post('/api/auth/sync', requireAuth, async (req, res) => {
    const { uid, email, name, picture } = req.user;
    await users.updateOne(
      { uid },
      {
        $set: { email, name, picture, updatedAt: new Date() },
        $setOnInsert: { uid, createdAt: new Date() },
      },
      { upsert: true },
    );
    const user = await users.findOne({ uid });
    res.json({ user });
  });

  app.get('/api/products', async (_req, res) => {
    const all = await products.find().toArray();
    res.json(all);
  });

  app.post('/api/payment/create-order', requireAuth, async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const productIds = items.map((i) => new ObjectId(i.productId));
    const dbProducts = await products.find({ _id: { $in: productIds } }).toArray();
    const priceMap = new Map(dbProducts.map((p) => [String(p._id), p.price]));

    let totalPaise = 0;
    const validatedItems = items.map((i) => {
      const price = priceMap.get(i.productId);
      if (price == null) throw new Error(`Product ${i.productId} not found`);
      const qty = Math.max(1, parseInt(i.qty, 10) || 1);
      totalPaise += Math.round(price * 100) * qty;
      const product = dbProducts.find((p) => String(p._id) === i.productId);
      return { productId: i.productId, name: product.name, price, qty };
    });

    const rpOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({
      orderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: RAZORPAY_KEY_ID,
      appName: APP_NAME,
      items: validatedItems,
    });
  });

  app.post('/api/payment/verify', requireAuth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount } = req.body;

    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const order = {
      userEmail: req.user.email,
      userId: req.user.uid,
      items,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid',
      appName: APP_NAME,
      createdAt: new Date(),
    };
    const result = await orders.insertOne(order);
    res.json({ ok: true, orderId: result.insertedId });
  });

  app.get('/api/orders', requireAuth, async (req, res) => {
    const list = await orders.find({ userEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
    res.json(list);
  });

  app.use((err, _req, res, _next) => {
    console.error('Route error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  });

  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
