require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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


        app.get('/categories', async(req,res)=>{
            const cursor = categoriesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/categories/recentProdcut',async(req,res)=>{
            
            const query = {}
            const cursor = categoriesCollection.find(query).sort({date: -1}).limit(6);
            const result = await cursor.toArray()
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