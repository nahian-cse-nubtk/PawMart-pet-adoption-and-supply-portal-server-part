require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express()
const cors = require('cors');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware
app.use(cors())
app.use(express.json())

async function run(){
    try{
        await client.connect();
        const pawmart_db = client.db("pawmart_db")
        const categoriesCollection =pawmart_db.collection("catagories")
        const ordersCollection = pawmart_db.collection("orders")

        app.get('/categories', async(req,res)=>{
            const email = req.query.email
            const query ={}
            if(email){
                query.email = email;
            }
            const cursor = categoriesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/categories/recentProdcut',async(req,res)=>{

            const query = {}
            const cursor = categoriesCollection.find(query).sort({date: -1}).limit(6);
            const result = await cursor.toArray()
            res.send(result);
        })
        app.get('/categories/:categoryId', async(req,res)=>{
            const id = req.params.categoryId;

            const query ={_id: new ObjectId(id)}
            const result = await categoriesCollection.findOne(query);
            res.send(result);
        })
        app.get('/categories/:category', async(req,res)=>{
            const categoryRequest = req.params.category;
            const query ={category: categoryRequest}

            const cursor = categoriesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })



        app.get('/onlycategories', async(req,res)=>{
    const docs = await categoriesCollection.aggregate([
      { $group: { _id: "$category" } },
      { $match: { _id: { $ne: null } } },
      { $project: { _id: 0, category: "$_id" } }
    ]).toArray();
    const categories = docs.map(d => d.category);
    return res.json(categories);

        })

        app.post('/categories', async(req,res)=>{
            const data = req.body;

            const result = await categoriesCollection.insertOne(data);
            res.send(result);
        })
        app.post('/orders',async(req,res)=>{
            const orderData = req.body;
            const result = await ordersCollection.insertOne(orderData)
            res.send(result);
        })
        app.get('/orders', async(req,res)=>{
            const email = req.query.email;
            const query= {}
            if(email){
                query.email= email;
            }
            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        app.patch('/categories/:categoryId', async(req,res)=>{
            const id = req.params.categoryId;

            const updatedData = req.body;

            const updateDoc={
                $set: updatedData
            }
            const query ={_id: new ObjectId(id)}
            const result = await categoriesCollection.updateOne(query,updateDoc);
            res.send(result);
        })
        app.delete('/categories/:categoryId', async(req,res)=>{
            const id = req.params.categoryId;

            const query ={_id: new ObjectId(id)}
            const result = await categoriesCollection.deleteOne(query);
            res.send(result);
        })


        await client.db("admin").command({ping: 1})
        console.log("Connection successfull")
    }
    finally{
        //
    }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('The pawmart server is running properly')
})



const port = process.env.PORT||5000;
app.listen(port,()=>{
    console.log(`The server is running at port ${port}`)
})