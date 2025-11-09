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