const express = require('express');
const cors = require("cors");
const app = express();
require('dotenv').config();
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("College Hub Is Running")
})

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.bqstehg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const collegeCollection = client.db('collegeHubDB').collection('colleges');
    const userCollection = client.db('collegeHubDB').collection('users');
    const appliedCollegeCollection = client.db('collegeHubDB').collection('appliedColleges');
    const userReviewCollection = client.db('collegeHubDB').collection('userReviews');

    // clg card api 
    app.get('/college-card', async (req, res) => {
      const cursor = collegeCollection.find().limit(4);
      const result = await cursor.toArray();
      res.send(result);
    })

    // clg page card api 
    app.get('/colleges', async (req, res) => {
      const cursor = collegeCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    // clg name api 
    app.get('/colleges-name', async (req, res) => {
      const cursor = collegeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // clg id api 
    app.get('/colleges/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    })

    // Apply related api
    app.get('/get-my-college', async (req, res) => {
      const result = await appliedCollegeCollection.find().toArray();
      res.send(result)
    })

    app.post('/applied-college', async (req, res) => {
      const appliedCollege = req.body;
      // console.log(appliedCollege);
      const result = await appliedCollegeCollection.insertOne(appliedCollege);
      res.send(result);
    })

    // review related api
    app.get('/get-review', async (req, res) =>{
      const result = await userReviewCollection.find().toArray();
      res.send(result);
    })

    app.post('/add-review', async (req, res) => {
      const review = req.body;
      const result = await userReviewCollection.insertOne(review);
      res.send(result);
    })

    // users api
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: "user already exist" })
      }
      // console.log(user)
      const result = await userCollection.insertOne(user);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`server is running on port: ${port}`)
})