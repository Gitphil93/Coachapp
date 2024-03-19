import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


dotenv.config();

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGO_DB;
const saltRounds = process.env.SALTROUNDS

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




const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds); 
    const hashedPassword = await bcrypt.hash(password, salt); 
    return hashedPassword; 
  } catch (error) {
    throw new Error('Kunde inte hasha lösenordet'); 
  }
};

const comparePassword = async (password, storedPassword) => {
  const isTheSame = await bcrypt.compare(password, storedPassword);
  console.log(isTheSame)
  return isTheSame;
}



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

    //Kolla så att nyckeln stämmer överens. gör den det så uppdatera användarobjektet med hashat lösenord
    if (existingUser.key === newUser.key) {
      const hashedPassword = await hashPassword(newUser.password);
      newUser.password = hashedPassword;
    const result = await usersCollection.updateOne({email: newUser.email}, {$set: {password: newUser.password}});
    res.status(201).json({ message: 'Användare tillagd', userId: result.insertedId });
  }
  } catch (error) {
    console.error('Kunde inte lägga till användare:', error);
    res.status(500).json({ message: 'Ett fel inträffade vid försök att lägga till användare' });
  }
});


app.post("/login", async (req, res) => {
  const credentials = req.body;
  console.log(credentials);

  const resObj = {
    success: false,
    token: ""
  };

  try {
    const database = client.db('Coachapp'); 
    const usersCollection = database.collection('users'); 

    const user = await usersCollection.findOne({ email: credentials.email });

    if (!user) {
      return res.status(400).json({ error: 'Användaren finns inte' });
    }

    const isPasswordMatch = await comparePassword(credentials.password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Fel lösenord' });
    }


    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: 1200
    });
    resObj.success = true;
    resObj.token = token;

    return res.status(200).json(resObj); 
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Error during login' }); 
  }
});


app.listen(port, () => {
  console.log("Server running at port " + port);
});
