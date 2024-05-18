
import express from "express"
import compression from 'compression';
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import transporter from './nodemailer.js'
import Stripe from 'stripe';
import multer from 'multer';
import sharp from "sharp"
import { S3Client, PutObjectCommand,DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from "fs"


const stripe = new Stripe(process.env.STRIPE_KEY);

console.log("stripe key:", process.env.STRIPE_KEY)
dotenv.config();


const app = express();
//Middleware
app.use(compression());
app.use(express.json());
const corsOptions = {
  origin: 'https://appleet.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
const port = process.env.PORT;
const uri = process.env.MONGODB_URI;
const saltRounds = 10;
let connectionPool = [];


async function createConnection() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    return client;
  } catch (error) {
    console.error("Error creating connection:", error);
    throw error;
  }
}

async function getConnection() {
  let connection;

  if (connectionPool.length === 0) {
    connection = await createConnection();
  } else {
    connection = connectionPool.pop();
  }
  
  return connection;
}

function releaseConnection(connection) {
  connectionPool.push(connection);
}

async function run() {
  let client
  try {
    client = await getConnection();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
}

run().catch(console.dir);


/*  app.options('*', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
}); */
 

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price: "price_1P9P8SP8D5bxhkopn6UJul76",
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 30,
      },
      customer_email: req.body.email,
      success_url: 'https://appleet-backend.vercel.app/success',
      cancel_url: 'https://appleet-backend.vercel.app/coach/register',
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error in Stripe session creation:', error);
    res.status(500).send("Failed to create checkout session");
  }
});

// When subscription started
//Unhandled event type customer.updated
//Unhandled event type invoice.created
//Unhandled event type invoice.finalized
//Unhandled event type invoice.paid
//Unhandled event type invoice.payment_succeeded
//Unhandled event type customer.subscription.created

app.post('/webhook', express.json({type: 'application/json'}), async (req, res) => {
  const eventType = req.body.type;
  const data = req.body.data.object; // Assumes that you are always passing the correct structure

  try {
    switch (eventType) {
      case 'payment_intent.succeeded':
      case "payment_intent.created":
      case 'payment_method.attached':
      case 'customer.subscription.created':
      case 'customer.updated':
      case "invoice.created":
      case "invoice.finalized":
      case "invoice.paid":
      case "invoice.payment_succeeded":

       /*  console.log(`${eventType} received with data:`, data); */
        break;

        case 'customer.subscription.updated':

          console.log("Subscription Updated", data);
          if (data.status === "active" || data.status === "trialing") {
            await updateActiveStatus(data.customer_email, true, 2000)
          } else {
            await updateActiveStatus(data.customer_email, false, 1999);
          }
          break;

          case 'invoice.payment_failed':
            console.log("Payment Failed", data);
            if (data.attempt_count === 3){
            await updateActiveStatus(data.customer_email, false, 1999);
           }
            break;

      case 'checkout.session.completed':
        if (data.payment_status === 'paid' || data.mode === 'subscription') {
          await activateUserAccount(data.customer_email);
        }
        break;

        case 'customer.subscription.deleted':
          console.log("Subscription Deleted", data);
          await updateActiveStatus(data.customer_email, false, 1999);
          break;

      default:
        console.log(`Unhandled event type ${eventType}`);
    }

    res.json({received: true}); // Acknowledge receipt of the event
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function updateActiveStatus(email, isActive, role) {
  const client = await getConnection();
  try {
    const db = client.db("Coachapp");
    const usersCollection = db.collection("users");
    const updateResult = await usersCollection.updateOne(
      { email: email },
      { $set: { isActive: isActive, role: role } }
    );
    console.log(`Active status updated for ${email} to ${isActive}`, updateResult);
  } catch (error) {
    console.error("Failed to update user active status:", error);
    throw error;
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
}

async function activateUserAccount(email) {
  const client = await getConnection();
  try {
    const db = client.db("Coachapp");
    const usersCollection = db.collection("users");
    const updateResult = await usersCollection.updateOne(
      { email: email },
      { $set: { isActive: true, role: 2000} }
    );
    console.log(`Account activated for ${email}`, updateResult);
  } catch (error) {
    console.error("Failed to activate user:", error);
    throw error; // Rethrow to handle in the calling function
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
}


const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Kunde inte hasha lösenordet");
  }
};

const comparePassword = async (password, storedPassword) => {
  const isTheSame = await bcrypt.compare(password, storedPassword);
  return isTheSame;
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.decoded = decoded;
    next();
  });
};

const verifyRole = (requiredRole) => (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (decoded.role < requiredRole) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

//Här registrerar man atleten. Lägg in Email, namn och nyckel i databas
app.post("/admin/register", verifyRole(2000), async (req, res) => {
  const newUser = req.body;
  let client
  
  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    
      const emailResult = await transporter.sendMail({
        from: 'Appleet <philipjansson1027@hotmail.com>',
        to:/*  newUser.email */ "philipjansson1027@hotmail.com",
        subject: 'Välkommen Till Appleet!',
        text: `Hej ${newUser.name}! ${newUser.coach} har lagt till dig som användare på Appleet. din användarnyckel är: ${newUser.key}. Kopiera nyckeln och klicka på länken för att registrera dig. http://appleet.vercel.app/register.
        
        Detta meddelande går ej att besvara.`,
        html:""
      });
    
      console.log('E-postmeddelande skickat:', emailResult);
   

    //Kolla om användare finns
    const existingUser = await usersCollection.findOne({
      email: newUser.email,
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Användaren finns redan i databasen" });
    }

    // Lägg till användaren i databasen
    const result = await usersCollection.insertOne(newUser);
    res
      .status(201)
      .json({ message: "Användare tillagd", userId: result.insertedId });
  } catch (error) {
    console.error("Kunde inte lägga till användare:", error);
    res
      .status(500)
      .json({
        message: "Ett fel inträffade vid försök att lägga till användare",
      });
  } finally  {
    if (client) {
      releaseConnection(client)
    }
  }
});

// Här registerar sig atleten själv. Man ska jämföra med nyckeln som redan finns i
// användarobjektet
app.post("/athlete/register", async (req, res) => {
  const newUser = req.body;
  let client

  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    //Kolla om användare finns
    const existingUser = await usersCollection.findOne({
      email: newUser.email,
    });

    //Kolla så att nyckeln stämmer överens. gör den det så uppdatera användarobjektet med hashat lösenord
    if (existingUser.key === newUser.key) {
      const hashedPassword = await hashPassword(newUser.password);
      newUser.password = hashedPassword;
      const result = await usersCollection.updateOne(
        { email: newUser.email },
        { $set: { password: newUser.password } },
      );
      res
        .status(201)
        .json({ message: "Användare tillagd", userId: result.insertedId });
    }
  } catch (error) {
    console.error("Kunde inte lägga till användare:", error);
    res
      .status(500)
      .json({
        message: "Ett fel inträffade vid försök att lägga till användare",
      });
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
});

app.post("/coach/register", async (req, res) => {
  const { name, lastname, email, role, password } = req.body;
  let client
  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      if (existingUser.isActive) {
        return res.status(409).json({ message: "User already exists and is active. Please log in." });
      } else {
        // User exists but is inactive, update with new data
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await usersCollection.updateOne(
          { _id: existingUser._id },
          { $set: { name, lastname, role, password: hashedPassword, isActive: false } }
        );
        return res.status(202).json({ message: "Existing inactive account updated. Please complete payment to activate.", userId: existingUser._id });
      }
    }

    // If no existing user, create new
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await usersCollection.insertOne({
      name,
      lastname,
      email,
      role,
      password: hashedPassword,
      isActive: false
    });

    res.status(201).json({ message: "User registered, pending payment", userId: newUser.insertedId });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});


app.post("/login", async (req, res) => {
  const credentials = req.body;
  let client

  const resObj = {
    success: false,
    token: "",
  };

  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    const user = await usersCollection.findOne({ email: credentials.email });

    if (!user) {
      return res.status(400).json({ error: "Användaren finns inte" });
    }

    const isPasswordMatch = await comparePassword(
      credentials.password,
      user.password,
    );

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Fel lösenord" });
    }

    const token = jwt.sign({ email: user.email, name:user.name, lastname:user.lastname, role: user.role, profileImage: user.profileImage, thumbnailImage: user.thumbnailImage }, process.env.JWT_SECRET, {
      expiresIn: 86400, //24 timmar i sekunder
    });
    resObj.success = true;
    resObj.token = token;

    return res.status(200).json(resObj);
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Error during login" });
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
});

app.post("/refresh-token", verifyToken, async (req, res) => {
  try {
    const { email, role } = req.decoded;

    // Skapa en ny JWT-token med samma användaruppgifter och en ny expirationstid
    const token = jwt.sign({ email, role }, process.env.JWT_SECRET, {
      expiresIn: 172800, // 48 timmar
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ error: "Error refreshing token" });
  }
});


app.get("/get-user", verifyToken, async (req, res) => {
  let client
  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");
  
    const user = await usersCollection.findOne({ email: req.decoded.email });
    if (user) {
      res.status(200).json({ success: true, user: user });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Användaren hittades inte" });
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Ett fel inträffade vid hämtning av användare",
      });
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
});

app.get("/get-all-users", verifyToken, async (req, res) => {
  let client;
  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    // Hämta den inloggade användarens e-post från token
    const loggedInUserEmail = req.decoded.email;

    // Hämta den inloggade användarens roll från dess användarobjekt
    const loggedInUserRole = req.decoded.role;

    // Kontrollera om användaren har rollen 3000 (admin)
    if (loggedInUserRole === 3000) {
      // Om användaren är admin, hämta alla användare oavsett coach
      const allUsers = await usersCollection.find().toArray();
      if (allUsers.length > 0) {
        res.status(200).json({ success: true, users: allUsers });
      } else {
        res.status(404).json({ success: false, message: "Inga användare hittades" });
      }
      return;
    }

    // Hämta den inloggade användarens coach från dess användarobjekt
    const loggedInUser = await usersCollection.findOne({ email: loggedInUserEmail });
    const loggedInUserCoach = loggedInUser.coach;

    // Kontrollera om användaren försöker hämta sig själv
    const requestedUserEmail = req.query.email;
    if (requestedUserEmail && requestedUserEmail === loggedInUserEmail) {
      // Användaren försöker hämta sig själv, tillåt det oavsett coach-informationen
      const user = await usersCollection.findOne({ email: loggedInUserEmail });
      res.status(200).json({ success: true, user: user });
      return;
    }

    // Hämta alla användare som har samma coach som den inloggade användaren
    const allUsers = await usersCollection.find({ coach: loggedInUserCoach }).toArray();

    if (allUsers.length > 0) {
      res.status(200).json({ success: true, users: allUsers });
    } else {
      res.status(404).json({ success: false, message: "Inga användare hittades" });
    }
  } catch (error) {
    console.error("Error retrieving all users:", error);
    res.status(500).json({
      success: false,
      message: "Ett fel inträffade vid hämtning av alla användare",
    });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});

app.get("/search-users", verifyToken, async (req, res) => {
  const { search } = req.query;
  let client;
  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    const searchQuery = search ? { name: { $regex: search, $options: "i" } } : {};
    const users = await usersCollection.find(searchQuery).toArray();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Ett fel inträffade vid sökning av användare",
    });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});



app.post("/add-exercise", verifyRole(2000), async (req, res) => {
  const newExercise = req.body;
  console.log(newExercise);
  let client;
  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const exerciseCollection = database.collection("exercises");

    // Antag att coach informationen skickas med i request body
    const { name, coach } = newExercise;

    // Sök efter en befintlig övning med samma namn och samma coach
    const existingExercise = await exerciseCollection.findOne({
      name: name,
      coach: coach
    });

    if (existingExercise) {
      return res.status(401).json({ error: "En övning med detta namn finns redan registrerad av dig." });
    }

    // Lägg till ny övning om ingen duplicering hittades
    const result = await exerciseCollection.insertOne(newExercise);
    res.status(200).json({ message: "Övning tillagd", exerciseId: result.insertedId });
  } catch (err) {
    console.error("Något gick fel, kunde inte spara övning", err);
    res.status(500).json({ error: "Ett fel inträffade vid tilläggning av övningen" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});


app.get("/get-exercises", verifyToken, async (req, res) => {
  let client;
  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const exerciseCollection = database.collection("exercises");

    // Hämta den inloggade användarens roll från token
    const loggedInUserRole = req.decoded.role;

    // Om användarens roll är 3000 (admin), hämta alla övningar oavsett coach
    if (loggedInUserRole === 3000) {
      const exercises = await exerciseCollection.find().toArray();
      if (exercises.length > 0) {
        res.status(200).json(exercises);
      } else {
        res.status(404).json({ success: false, message: "Inga övningar hittades" });
      }
      return;
    }

    // Hämta den inloggade användarens email från token
    const email = req.decoded.email


    // Hämta övningar där coach = email
    const exercises = await exerciseCollection.find({ coach: email }).toArray();
    if (exercises.length > 0) {
      res.status(200).json(exercises);
    } else {
      res.status(404).json({ success: false, message: "Inga övningar hittades" });
    }
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ success: false, message: "Ett fel inträffade vid hämtning av övningar" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});

app.post("/admin/post-global-message", verifyToken, verifyRole(2000), async (req, res) => {
  const globalMessage = req.body;
  let client;
  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const globalMessageCollection = database.collection("globalmessage");

    // Hämta rollen för den inloggade användaren från dekrypterad token
    const userRole = req.decoded.role;
    
    // Hämta användarens coach från dekrypterad token
    const currentUserCoach = req.decoded.email;

    // Kontrollera användarens roll och tillåt endast tränare och admin att posta globala meddelanden
    if (userRole === 2000 || userRole === 3000) {
      // Kolla om det redan finns ett globalt meddelande från samma tränare
      const existingMessage = await globalMessageCollection.findOne({ coach: currentUserCoach });
      
      if (existingMessage) {
        // Uppdatera det befintliga globala meddelandet
        await globalMessageCollection.updateOne({ coach: currentUserCoach }, { $set: globalMessage });
        res.status(200).json({ message: "Globalt meddelande uppdaterat" });
      } else {
        // Om det inte finns ett befintligt meddelande, lägg till ett nytt
        const result = await globalMessageCollection.insertOne(globalMessage);
        res.status(200).json({ message: "Globalt meddelande tillagt", messageId: result.insertedId });
      }
    } else {
      // Om användaren inte har rätt behörighet, avvisa begäran
      return res.status(403).json({ error: "Du har inte behörighet att posta globala meddelanden" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Något gick fel vid hantering av globalt meddelande" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});


app.get("/get-global-message", verifyToken, async (req, res) => {
  let client;
  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const globalMessageCollection = database.collection("globalmessage");

    // Hämta användarens roll från dekrypterad token
    const userRole = req.decoded.role;
    
    let globalMessage;

    if (userRole === 3000) {
      globalMessage = await globalMessageCollection.find().toArray();
    } else if (userRole === 2000) {
      // Om användaren är tränare (2000), hämta det globala meddelandet som de har skrivit
      const currentUser = req.decoded.email;
      globalMessage = await globalMessageCollection.findOne({ coach: currentUser });
    } else if (userRole === 1000) {
      // Om användaren är användare (1000), hämta det globala meddelandet som deras coach har skrivit
      const currentUserCoach = `${req.decoded.coach}`;
      globalMessage = await globalMessageCollection.findOne({ coach: currentUserCoach });
    }


    if (!globalMessage) {
      return res.status(404).json({ error: "Inget globalt meddelande hittades" });
    }

    // Returnera det globala meddelandet baserat på användarrollen
    res.status(200).json({ globalMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Något gick fel vid hämtning av globalt meddelande" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});





app.post("/post-session",verifyRole(2000), async (req, res) => {
  const session = req.body
  let client

  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const sessionsCollection = database.collection("sessions");

    const result = await sessionsCollection.insertOne(session)
    res
    .status(200)
    .json({ message: "Träningspass tillagt", session: session });

  } catch (err) {
    console.error("Kunde inte posta träningspass", err)
    res
    .status(500)
    .json({
      message: "Ett fel inträffade vid försök att lägga till träningspass",
    });
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
})

app.get("/get-sessions", verifyToken, async (req, res) => {
  let client;
  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const sessionCollection = database.collection("sessions");

    const loggedInUserRole = req.decoded.role;
    const loggedInUserEmail = req.decoded.email; 

    let query = {};

    if (loggedInUserRole === 3000) {
      // Admins get all sessions
      query = {}; // no filter, fetch all sessions
    } else if (loggedInUserRole === 2000) {
      // Coaches get sessions where they are either the coach or an attendee
      query = {
        $or: [
          { coach: loggedInUserEmail },
          { "attendees.email": loggedInUserEmail }
        ]
      };
    } else if (loggedInUserRole === 1000) {
      // Regular users get sessions where they are attendees
      query = { "attendees.email": loggedInUserEmail };
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const sessions = await sessionCollection.find(query).toArray();
    if (sessions.length > 0) {
      res.status(200).json({ success: true, sessions: sessions });
    } else {
      res.status(404).json({ success: false, message: "Inga sessioner hittades" });
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ success: false, message: "Ett fel inträffade vid hämtning av sessioner" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});




app.post("/add-comment/:sessionId/:exerciseId", verifyToken, async (req, res) => {
  const sessionId = req.params.sessionId;
  const exerciseId = req.params.exerciseId;
  const author = req.body.author;
  const comment = req.body.userComment;
  const exerciseResult = req.body.result;
  const email = req.body.email
  console.log(1,comment)

  let client;

  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const sessionsCollection = database.collection("sessions");

    const { ObjectId } = require('mongodb');
    const sessionObjectId = new ObjectId(sessionId);

    const updateOperations = {};

    if (comment !== "") {
      // Lägg till en kommentar om den finns
      updateOperations["$addToSet"] = {
        "exercises.$.userComments": {
          email: email,
          author: author,
          comment: comment,
        }
      };
    }

    if (exerciseResult !== undefined) {
      // Lägg till ett resultat om det finns
      if (!updateOperations["$addToSet"]) updateOperations["$addToSet"] = {};
      updateOperations["$addToSet"]["exercises.$.results"] = {
        email: email,
        author: author,
        value: exerciseResult,
      };
    }

    const result = await sessionsCollection.updateOne(
      { _id: sessionObjectId, "exercises._id": exerciseId },
      updateOperations
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Ingen uppdatering gjordes" });
    }

    res.status(200).json({ message: "Kommentar och/eller resultat har lagts till" });
  } catch (error) {
    console.error("Ett fel uppstod vid hantering av kommentaren:", error);
    res.status(500).json({ error: "Ett fel uppstod vid hantering av kommentaren" });
  } finally {
    if (client) {
      client.close();
    }
  }
});



app.delete("/delete-session/:sessionId", verifyRole(2000), async (req, res) => {
  const sessionId = req.params.sessionId;
  let client;

  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const sessionsCollection = database.collection("sessions");

    const { ObjectId } = require('mongodb');
    const sessionObjectId = new ObjectId(sessionId);

    // Ta bort passet från databasen baserat på dess ID
    const result = await sessionsCollection.deleteOne({ _id: sessionObjectId });

    // Kontrollera om passet togs bort framgångsrikt
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Passet har tagits bort" });
    } else {
      res.status(404).json({ error: "Kunde inte hitta passet att ta bort" });
    }
  } catch (error) {
    console.error("Ett fel uppstod vid borttagning av passet:", error);
    res.status(500).json({ error: "Ett fel uppstod vid borttagning av passet" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});

app.put("/update-session/:sessionId", verifyToken, async (req, res) => {
  const sessionId = req.params.sessionId;
  const userEmail = req.body.email; // E-posten som skickas med förfrågan
  const summaryComment = req.body.summaryComment;
  const howDidSessionGo = req.body.howDidSessionGo;

  let client;

  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const sessionsCollection = database.collection("sessions");

    const { ObjectId } = require('mongodb');
    const sessionObjectId = new ObjectId(sessionId);

    // Uppdatera endast den specifika deltagaren i sessionen
    const result = await sessionsCollection.updateOne(
      { _id: sessionObjectId, "attendees.email": userEmail },
      { $set: { 
          "attendees.$.signed": true, 
          "attendees.$.summaryComment": summaryComment,
          "attendees.$.howDidSessionGo": howDidSessionGo
      } }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Sessionen och deltagarstatus har uppdaterats" });
    } else {
      res.status(404).json({ error: "Kunde inte hitta sessionen eller deltagaren att uppdatera" });
    }
  } catch (error) {
    console.error("Ett fel uppstod vid uppdatering av sessionen:", error);
    res.status(500).json({ error: "Ett fel uppstod vid uppdatering av sessionen" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});

app.delete("/delete-user", verifyToken, verifyRole(2000), async (req, res) => {
  let client;

  try {
      const userEmail = req.body.email;

      client = await getConnection();
      const database = client.db("Coachapp");
      const usersCollection = database.collection("users");

      // Delete the user
      const result = await usersCollection.deleteOne({ email: userEmail });
      if (result.deletedCount === 0) {
          return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ error: "Failed to delete user" });
  } finally {
      if (client) {
          releaseConnection(client);
      }
  }
});

app.delete("/delete-exercise/:exerciseId", verifyToken, verifyRole(2000), async (req, res) => {
  const exerciseId = req.params.exerciseId;
  let client;
 
  try {
      // Connect to the MongoDB client
      client = await getConnection();
      const database = client.db("Coachapp");
      const exercises = database.collection("exercises");

      // Construct query to find the exercise by ID and coach
      const query = {
          _id: new ObjectId(exerciseId)
      };

      const result = await exercises.deleteOne(query);

      if (result.deletedCount === 1) {
          res.status(200).json({ message: "Successfully deleted one document." });
      } else {
          res.status(404).json({ message: "No documents matched the query. Deleted 0 documents or you do not own this exercise." });
      }
  } catch (err) {
      console.error("Failed to delete exercise:", err);
      res.status(500).json({ message: "Failed to delete exercise" });
  } finally {
    if (client) {
      releaseConnection(client);
  }
  }
});

app.delete("/admin/delete-global-message", verifyToken, verifyRole(2000), async (req, res) => {
 
  let client;
  const message = req.body.messageId

  try {
      client = await getConnection();
      const db = client.db("Coachapp");
      const globalMessage = db.collection("globalmessage");



      const result = await globalMessage.deleteOne({ _id: new ObjectId(message) });

      if (result.deletedCount === 1) {
          res.status(200).json({ message: "Globalt meddelande raderat" });
      } else {
          res.status(404).json({ message: "Inget globalt meddelande hittades att radera" });
      }
  } catch (error) {
      console.error("Failed to delete global message:", error);
      res.status(500).json({ message: "Misslyckades med att radera det globala meddelandet" });
  } finally {
    if (client) {
      releaseConnection(client);
  }
  }
});

const s3Client = new S3Client({region: "eu-north-1", credentials: {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
} });

const upload = multer({ dest: 'uploads/' });

app.post('/upload-image', verifyToken, upload.single('profileImage'), async (req, res) => {
  const file = req.file;
  const userEmail = req.decoded.email;
  const bucketName = 'appleetbucket';

  const handledEmail = userEmail.replace(/@/g, '-at-');
  const thumbnailKey = `thumbnail-${handledEmail}.jpeg`;
  const profilePicKey = `profilepic-${handledEmail}.jpeg`;

  try {
      const fileBuffer = fs.readFileSync(file.path);

      // Hämta befintlig profilbild och thumbnail från databasen
      const existingImages = await getImageUrlFromDatabase(userEmail);

      // Skapa thumbnail och profilbild
      const thumbnailBuffer = await sharp(fileBuffer).rotate().resize(100, 100).jpeg({ quality: 90 }).toBuffer();
      const profilePicBuffer = await sharp(fileBuffer).rotate().resize(300, 300).jpeg({ quality: 90 }).toBuffer();

      // Radera befintliga bilder om de finns
      if (existingImages && existingImages.profileImageUrl) {
          await s3Client.send(new DeleteObjectCommand({
              Bucket: bucketName,
              Key: thumbnailKey,
          }));
          await s3Client.send(new DeleteObjectCommand({
              Bucket: bucketName,
              Key: profilePicKey,
          }));
      }

      // Ladda upp de nya bilderna
      await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ACL: "public-read",
          CacheControl: 'no-cache, must-revalidate'
      }));

      await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: profilePicKey,
          Body: profilePicBuffer,
          ACL: "public-read",
          CacheControl: 'no-cache, must-revalidate'
      }));

      // Spara nya URL:er i databasen
      await saveImageReferenceToDatabase(userEmail, thumbnailKey, profilePicKey, bucketName);

      // Radera den lokala filen
      fs.unlink(file.path, err => {
          if (err) {
              console.error("Failed to delete local file", err);
          }
      });

      res.status(200).json({
          message: "Image and thumbnail updated successfully",
          profileImageUrl: `https://${bucketName}.s3.eu-north-1.amazonaws.com/${profilePicKey}`,
          thumbnailUrl: `https://${bucketName}.s3.eu-north-1.amazonaws.com/${thumbnailKey}`
      });
  } catch ( error) {
      console.error("Failed to process or upload image", error);
      res.status(500).json({ error: "Failed to upload image" });
  }
});

async function getImageUrlFromDatabase(email) {
  const client = await getConnection();
  try {
      const db = client.db("Coachapp");
      const usersCollection = db.collection("users");
      const user = await usersCollection.findOne({ email: email });
      return user ? { profileImageUrl: user.profileImage, thumbnailUrl: user.thumbnailImage } : null;
  } catch (error) {
      console.error("Error retrieving image URL from database:", error);
      return null;
  } finally {
      releaseConnection(client);
  }
}

async function saveImageReferenceToDatabase(userEmail, thumbnailKey, profilePicKey, bucketName) {
  const client = await getConnection();
  try {
      const database = client.db("Coachapp");
      const usersCollection = database.collection("users");
      const updateResult = await usersCollection.updateOne(
          { email: userEmail },
          { $set: { profileImage: `https://${bucketName}.s3.eu-north-1.amazonaws.com/${profilePicKey}`, thumbnailImage: `https://${bucketName}.s3.eu-north-1.amazonaws.com/${thumbnailKey}` } }
      );
      console.log(`Image URL updated for user ${userEmail}`);
  } catch (error) {
      console.error("Failed to save image reference in database:", error);
  } finally {
      releaseConnection(client);
  }
}

app.put("/update-user/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;  
  console.log(updates)// Detta förväntas vara ett objekt med nycklar och värden som ska uppdateras
  let client;

  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    // Bygg ett objekt för $set som dynamiskt genererar sökvägar för varje uppdaterad egenskap
    const setObj = {};
    for (const key in updates) {
      setObj[`profile.${key}`] = updates[key];
    }

    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: setObj }
    );

    if (updateResult.modifiedCount === 0) {
      res.status(404).json({ message: "Ingen användare hittades eller inga uppdateringar gjordes" });
    } else {
      res.status(200).json({ message: "Användarprofil uppdaterad" });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Ett fel inträffade vid uppdatering av användarprofilen" });
  } finally {
    if (client) {
      releaseConnection(client);
    }
  }
});

app.post("/add-pb/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { newPb } = req.body;
  
  // Skapa ett nytt ObjectId om inget id tillhandahålls
  if (!newPb._id) newPb._id = new ObjectId();

  let client;

  try {
      client = await getConnection();
      const database = client.db("Coachapp");
      const usersCollection = database.collection("users");

      const updateResult = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $push: { "profile.personalBests": newPb } }
      );

      if (updateResult.modifiedCount === 0) {
          res.status(404).json({ message: "No user found or no updates made" });
      } else {
          res.status(201).json({ message: "Personal best added successfully", newPb });
      }
  } catch (error) {
      console.error("Error adding personal best:", error);
      res.status(500).json({ message: "An error occurred while adding the personal best" });
  } finally {
      if (client) {
          releaseConnection(client);
      }
  }
});

app.post("/add-sb/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { newSb } = req.body;
  
  // Skapa ett nytt ObjectId om inget id tillhandahålls
  if (!newSb._id) newSb._id = new ObjectId();

  let client;

  try {
      client = await getConnection();
      const database = client.db("Coachapp");
      const usersCollection = database.collection("users");

      const updateResult = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $push: { "profile.seasonBests": newSb } }
      );

      if (updateResult.modifiedCount === 0) {
          res.status(404).json({ message: "No user found or no updates made" });
      } else {
          res.status(201).json({ message: "Season best added successfully", newSb });
      }
  } catch (error) {
      console.error("Error adding personal best:", error);
      res.status(500).json({ message: "An error occurred while adding the season best" });
  } finally {
      if (client) {
          releaseConnection(client);
      }
  }
});





app.listen(port, () => {
  console.log("Server running at port " + port);
});
