const express = require('express')
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

function verifyJWT(req,res,next){
    const AuthHeader = req.headers.authorization
    if(!AuthHeader){
        return res.status(401).send({massage:"unauthorized access"})
    }

    const token = AuthHeader.split(' ')[1]
    jwt.verify(token ,'292e788bfb19638ca7a80969097a6f3e8ccf2f3cf79935e5dd2263433f00e42b',(err,decoded) =>{
        if(err){
            return res.status(403).send({massage:"Forbidden"})
        }
        req.decoded = decoded
    } )
    next();

}

const uri = `mongodb+srv://user2:V8f93SloD9YTCaIy@cluster0.4yyma.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productCollection = client.db('Inventory').collection('product')

        app.post('/login' , async(req,res) =>{
            const user = req.body
            const accessToken = jwt.sign(user,'292e788bfb19638ca7a80969097a6f3e8ccf2f3cf79935e5dd2263433f00e42b', {
                expiresIn:'id'
            })
            res.send({accessToken})
        })

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

        app.put('/product/:id' , async(req,res) =>{
            const id = req.params.id
            const data = req.body
            const filter = {_id:ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set:{
                    ...data
                },
            }

            const result = await productCollection.updateOne(filter,updateDoc,options)
            res.send(result)
        })

        app.get('/myitems', verifyJWT , async(req,res) =>{
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if(email == decodedEmail){
                const query = {email:email}
                const cursor = productCollection.find(query)
                const items = await cursor.toArray()
                res.send(items) 
            }
            else{
                res.status(403).send({massage:"Forbidden"})
            }
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