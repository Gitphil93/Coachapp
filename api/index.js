const express = require("express");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const { ObjectId } = require('mongodb');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require('./nodemailer.js');
const webPush = require('web-push');


dotenv.config();

webPush.setVapidDetails(
  'mailto:philipjansson1027@hotmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const app = express();
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

app.use(express.json());
app.use(cors());

app.options('*', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});


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
        to: newUser.email,
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
app.post("/register", async (req, res) => {
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

    const token = jwt.sign({ email: user.email, name:user.name, lastname:user.lastname, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: 12000,
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

    // Hämta den inloggade användarens namn och efternamn från token
    const loggedInUserName = req.decoded.name;
    const loggedInUserLastName = req.decoded.lastname;
    const loggedInUserFullName = `${loggedInUserName} ${loggedInUserLastName}`;

    // Hämta övningar där coachen är sammanslagningen av namn och efternamn för den inloggade användaren
    const exercises = await exerciseCollection.find({ coach: loggedInUserFullName }).toArray();
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
    const currentUserCoach = `${req.decoded.name} ${req.decoded.lastname}`;

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
      const currentUser = `${req.decoded.name} ${req.decoded.lastname}`;
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

    // Hämta den inloggade användarens roll från token
    const loggedInUserRole = req.decoded.role;

    // Om användarens roll är 3000 (admin), hämta alla sessioner oavsett coach
    if (loggedInUserRole === 3000) {
      const sessions = await sessionCollection.find().toArray();
      if (sessions.length > 0) {
        res.status(200).json({ success: true, sessions: sessions });
      } else {
        res.status(404).json({ success: false, message: "Inga sessioner hittades" });
      }
      return;
    }

    // Hämta den inloggade användarens coach från dess användarobjekt
    const loggedInUserCoach = req.decoded.name + " " + req.decoded.lastname;

    // Om användarens roll är 2000 (coach), hämta alla sessioner där coach matchar användarens coach
    if (loggedInUserRole === 2000) {
      const sessions = await sessionCollection.find({ coach: loggedInUserCoach }).toArray();
      if (sessions.length > 0) {
        res.status(200).json({ success: true, sessions: sessions });
      } else {
        res.status(404).json({ success: false, message: "Inga sessioner hittades" });
      }
      return;
    }

    // Om användarens roll är 1000 (user), hämta alla sessioner där coach matchar användarens coach
    const sessions = await sessionCollection.find({ coach: loggedInUserCoach }).toArray();
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
  const author = req.body.author
  const comment = req.body.userComment;

  let client;

  try {
    client = await getConnection();
    const database = client.db("Coachapp");
    const sessionsCollection = database.collection("sessions");

    const { ObjectId } = require('mongodb');
    const sessionObjectId = new ObjectId(sessionId);

    // Uppdatera sessionen i databasen och använd $addToSet för att lägga till kommentaren
    const result = await sessionsCollection.updateOne(
      { 
        _id: sessionObjectId, 
        "exercises._id": exerciseId
      },
      { 
        $addToSet: { "exercises.$.userComment": {author: author, comment: comment} } 
      }
    );

    // Kontrollera om ingen uppdatering gjordes (kommentaren redan finns)
    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Kommentaren finns redan" });
    }

    // Skicka ett svar
    res.status(200).json({ message: "Kommentaren har lagts till" });
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




app.listen(port, () => {
  console.log("Server running at port " + port);
});
