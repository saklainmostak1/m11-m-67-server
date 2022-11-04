const express = require('express');
const app = express()
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())



// geniusDBuser
// 7Sx6276I7XaGBKqa
console.log(process.env.BD_USER)
console.log(process.env.DB_PASSWORD)

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DB_PASSWORD}@cluster0.ckrddue.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

 function verifyJWR(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: 'unauthorized message'})

    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded){
        if(error){
            res.status(401).send({message: 'unauthorized message'})
        }
        req.decoded = decoded;
        next()
    })

    // next()
 }

async function run(){
    try{
        const serviceCollection = client.db('geniusCar').collection('services')
        const orderCollection = client.db('geniusCar').collection('orders')

        app.post('/jwt', async(req, res)=>{
            const user = req.body
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h' })
            res.send({token})
        })

        app.get('/services', async(req,res)=>{
          const query  = {}
          const cursor = serviceCollection.find(query)
          const services = await cursor.toArray()
          res.send(services)
        })
        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })
        app.get('/orders', verifyJWR, async(req, res) =>{
            console.log(req.headers.authorization)

            let query = {}
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)
        })
        app.post('/orders', async(req, res)=>{
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })
        app.patch('/orders/:id', async(req, res)=> {
            const id = req.params.id
            const status = req.body.status
            const query = {_id: ObjectId(id)}
            const updateDoc = {
                $set:{
                    status: status
                }
            }
            const result = await orderCollection.updateOne(query, updateDoc)
            res.send(result)
        })
        app.delete('/orders/:id', async(req, res) =>{
            const id = req.params.id
            const quary = {_id: ObjectId(id) }
            const result = await orderCollection.deleteOne(quary)
            res.send(result)
        })
    }
    finally{

    }
}
run().catch(error => console.error(error))


app.get('/', (req, res) =>{
    res.send('genius car is running on server')
})



app.listen(port, (req, res) =>{
    console.log('api is running on', port)
})