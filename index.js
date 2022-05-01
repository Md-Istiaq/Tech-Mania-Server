const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://user2:V8f93SloD9YTCaIy@cluster0.4yyma.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productCollection = client.db('Inventory').collection('product')

        app.get('/product',async (req,res) =>{
            const query={}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        app.get('/product/:id', async(req,res) =>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const product = await productCollection.findOne(query)
            res.send(product)
        })

        app.post('/product', async(req,res) =>{
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct)
            res.send(result)
        })

        app.delete('/product/:id' , async(req,res) =>{
            const id = req.params.id
            const query = {_id:ObjectId(id)}
            const result = await productCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally{

    }

}
run().catch(console.dir)

app.get('/' , (req,res) =>{
    res.send("Running genius server")
})

app.listen(port, () =>{
    console.log("Listening to port",port)
})