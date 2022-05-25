const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rege1.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db('electro').collection('services')
    const userCollection = client.db('electro').collection('user')


    app.get('/services', async(req, res) =>{
        const query = {}
        const cursor = serviceCollection.find(query)
        const services = await cursor.toArray()
        res.send(services)
    }) 

    app.post('/services', async (req, res) =>{
        const service = req.body
        console.log(service);
        const result = await serviceCollection.insertOne(service) 
        res.send(result)
    })
    app.post('/users', async (req, res) =>{
        const user = req.body
        const result = await userCollection.insertOne(user) 
        res.send(result)
    })


  } finally {
  }
}

run().catch(console.dir());

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`all ok`);
});
