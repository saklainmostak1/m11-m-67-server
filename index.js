const express = require('express');
const app = express()
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

async function run(){
    try{
        const serviceCollection = client.db('geniusCar').collection('services')
        const orderCollection = client.db('geniusCar').collection('orders')

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
        app.get('/orders', async(req, res) =>{
            console.log(req.query)
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