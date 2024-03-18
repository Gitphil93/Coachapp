import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from "cors"


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
app.use(cors())


//Här registrerar man atleten. Lägg in Email, namn och nyckel i databas
app.post('/admin/register', async (req, res) => {
  const newUser = req.body
  console.log(newUser)

  try {
    const database = client.db('Coachapp'); 
    const usersCollection = database.collection('users'); 

    //Kolla om användare finns
    const existingUser = await usersCollection.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Användaren finns redan i databasen' });
    }

    // Lägg till användaren i databasen
    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({ message: 'Användare tillagd', userId: result.insertedId });
  } catch (error) {
    console.error('Kunde inte lägga till användare:', error);
    res.status(500).json({ message: 'Ett fel inträffade vid försök att lägga till användare' });
  }

})


// Här registerar sig atleten själv. Man ska jämföra med nyckeln som redan finns i
// användarobjektet
app.post('/register', async (req, res) => {
  const newUser = req.body;
  console.log(newUser) 

  try {
    const database = client.db('Coachapp'); 
    const usersCollection = database.collection('users'); 

    //Kolla om användare finns
    const existingUser = await usersCollection.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Användaren finns redan i databasen' });
    }

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
