const express = require('express');
// const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://arpitpepcoding_db_user:yk4gPm1Cz1dV9BEw@cluster0.c7j3uay.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
// app.use(cors());
app.use(express.json());

async function start() {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('Connected to MongoDB');

  const products = client.db('dummy').collection('product');

  app.get('/start', async (_req, res) => {
    const all = await products.find().toArray();
    console.log(all);
    res.json(all);
  });

  app.post('/post', async (_req, res) => {
    console.log("post")
    console.log(_req)
    res.json({
      "name":"post"
    });
  })

    app.get('/below4.5', async (_req, res) => {
    console.log("post")
    console.log(_req)
    res.json({
      "name":"post"
    });
  })

  const port = 3001;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
