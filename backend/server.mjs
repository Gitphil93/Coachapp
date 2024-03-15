import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGO_DB;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect(); 
    await client.db("admin").command({ ping: 1 }); 
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.use(express.json()); 

app.post('/users', async (req, res) => {
  const newUser = req.body; 

  try {
    const database = client.db('Coachapp'); 
    const usersCollection = database.collection('users'); 

    // Lägg till användaren i databasen
    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({ message: 'Användare tillagd', userId: result.insertedId });
  } catch (error) {
    console.error('Kunde inte lägga till användare:', error);
    res.status(500).json({ message: 'Ett fel inträffade vid försök att lägga till användare' });
  }
});

app.listen(port, () => {
  console.log("Server running at port " + port);
});
