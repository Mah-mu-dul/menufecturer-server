const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

const ObjectId = require("mongodb").ObjectID;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rege1.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

 const verifyJWT = (req, res, next) => {
   const authHeader = req.headers.authorization;
   if (!authHeader) {
     return res
       .status(401)
       .send({ messege: "un authorozied access dont find header" });
   }

   const token = authHeader?.split(" ")[1];
   jwt.verify(token, process.env.ACCESS_TOKEN_SECREATE, (err, decoded) => {
     if (err) {
       return res.status(403).send({ messege: "access forbidden " });
     }
     req.decoded = decoded;
   });
   next();
 };

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("electro").collection("services");
    const userCollection = client.db("electro").collection("user");
    const orderCollection = client.db("electro").collection("order");

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    // find all user to manage admin 
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
    // find all orders to manage order 
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
      console.log('try to getting all orders');
    });
// update role to make admin
       app.put("/users/:id",verifyJWT, async (req, res) => {
         const id = req.params.id;
         const updatedItem = req.body;
         const filter = { _id: ObjectId(id) };
         const options = { upsert: true };
         const updatedDoc = {
           $set: {
             role: updatedItem.role,
           },
         };
         const result = await userCollection.updateOne(
           filter,
           updatedDoc,
           options
         );
         const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {expiresIn: '24h'});
         res.send({result, token});
       });
      //  update order status for admin to manage orders
       app.put("/order/:id", async (req, res) => {
         const id = req.params.id;
         const updatedItem = req.body;
         const filter = { _id: ObjectId(id) };
         const options = { upsert: true };
         const updatedDoc = {
           $set: {
             status: updatedItem.status,
           },
         };
         const result = await orderCollection.updateOne(
           filter,
           updatedDoc,
           options
         );
        //  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {expiresIn: '24h'});
         res.send({result}); //add Token after the result
       });

    app.get("/user/:email", async (req, res) => {
      const e = req.params.email
      const query = { email: e};
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // find data from orders my email to  show my orders
    app.get("/order/:email", async (req, res) => {
      const e = req.params.email
      const query = { email: e};
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // send user to database 
    app.put('/user/:email',async(req,res)=>{
      const email =req.params.email
      const user  = req.body 
      const filter = {email:email}
      const option = {upsert:true}
      const updateDoc = {
        $set:user,
      }
      const result = await userCollection.updateOne(filter, updateDoc, option)
      res.send(result) 

    })

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

// find one by id
     app.get("/services/:id", async (req, res) => {
       const id = req.params.id;
       const query = { _id: ObjectId(id) };
       const result = await serviceCollection.findOne(query);

       res.send(result);
     });
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
