const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qw8qee2.mongodb.net/?retryWrites=true&w=majority`;

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

        const productCollection = client.db('techTroveDB').collection("products");
        const cartCollection = client.db('techTroveDB').collection("carts");
        const paymentCollection = client.db('techTroveDB').collection("payments");

        //------------- Product Collection Section -------------------


        //get all products from Product Collection
        app.get('/products', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result)
        })

        //get single product from Product Collection
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        //post product to the Product Collection
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('new product', product);
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

        //update products to the Product Collection
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;

            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedUser = {
                $set: {
                    product_name: updatedProduct.product_name,
                    price: updatedProduct.price,
                    quantity: updatedProduct.quantity,
                    rating: updatedProduct.rating,
                    description: updatedProduct.description
                }
            }

            const result = await productCollection.updateOne(filter, updatedUser, options);
            res.send(result);
        })

        //Delete products from the Product Collection
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('please delete from database', id);
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.deleteOne(query)
            res.send(result);
        })


        //------------- Cart Collection Section -------------------

        // get products from Cart Collection
        app.get('/cartProducts', async (req, res) => {
            const result = await cartCollection.find().toArray();
            res.send(result)
        })

        //get single product from cardProduct Collection
        app.get('/cartProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.findOne(query);
            res.send(result);
        })

        // post products from Cart Collection
        app.post("/cartProducts", async (req, res) => {
            const cartItem = req.body;
            const result = await cartCollection.insertOne(cartItem);
            res.send(result);
        });


        // Delete products from Cart Collection
        app.delete("/cartProducts/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });


        //-------------Payments Collection Section -------------------

        // post products to payments Collection, delete carts in cartCollection and Update Quantity in Product Collection

        // get products from Cart Collection
        app.get('/paidProducts', async (req, res) => {
            const result = await paymentCollection.find().toArray();
            res.send(result)
        })

        app.post("/payments", async (req, res) => {

            const paymentItem = req.body;
            const insertResult = await paymentCollection.insertOne(paymentItem);

            const query = { p_id: paymentItem.p_id };
            const cart = await cartCollection.findOne(query);

            const updateProductQuery = { _id: new ObjectId(cart.p_id) };

            const productUpdate = {
                $inc: { quantity: -1 },
                $currentDate: { updatedAt: true }
            };

            const updateResult = await productCollection.updateOne(updateProductQuery, productUpdate);


            const deleteResult = await cartCollection.deleteOne(query);

            res.send(insertResult, updateResult, deleteResult);

        });









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
    res.send('Tech Trove server is running');
})

app.listen(port, () => {
    console.log(`Sever is running on PORT:${port}`);
})