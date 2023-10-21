const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.phi4gnz.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        
        const showsCollection = client.db('showsDB').collection('show');
        const userShowsCollection = client.db('showsDB').collection('userShows');

        app.get('/show', async (req, res) => {
            const cursor = showsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/show/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await showsCollection.findOne(query);
            res.send(result);
        })

        app.get('/user-shows/:id', async (req, res) => {
            const id = req.params.id;
            const query = {userId: id};
            const result = await userShowsCollection.findOne(query);
            res.send(result);
        })

        app.post('/show', async (req, res) => {
            const newShow = req.body;
            console.log(newShow);
            const result = await showsCollection.insertOne(newShow);
            res.send(result);
        })

        app.put('/show/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = {upsert: true};
            const updatedShow = req.body;
            const show = {
                $set: {
                    image: updatedShow.image,
                    name: updatedShow.name,
                    brandName: updatedShow.brand,
                    type: updatedShow.type,
                    price: updatedShow.price,
                    rating: updatedShow.rating,
                    description: updatedShow.description
                }
            }
            
            const result = await showsCollection.updateOne(filter, show, options);
            res.send(result);
        })

        app.put('/user-shows/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUserShows = req.body;
            
            const filter = {userId: id};
            const existingUser = await userShowsCollection.findOne(filter);

            console.log(existingUser);

            if(existingUser){
                const options = {upsert: true};
                const userCart = {
                    $set: {
                        userId: updatedUserShows.userId,
                        updatedUserCartList: updatedUserShows.updatedUserCartList
                    }
                }
                const updateResult = await userShowsCollection.updateOne(filter, userCart, options);
                res.send(updateResult);
            }else{
                const insertResult = await userShowsCollection.insertOne(updatedUserShows);
                res.send(insertResult);
            }
        })

        // app.delete('/movie/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = {_id: new ObjectId(id)};
        //     const result = await showsCollection.deleteOne(query);
        //     res.send(result);
        // })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('midnight server is running');
})

app.listen(port, () => {
    console.log(`midnight server is running on port: ${port}`);
})
