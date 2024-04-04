const express = require("express");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

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
  console.log(connection)
  return connection;
}

function releaseConnection(connection) {
  connectionPool.push(connection);
}

async function run() {
  let client;
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
    console.log(hashedPassword)
    return hashedPassword;
  } catch (error) {
    throw new Error("Kunde inte hasha lösenordet");
  }
};

const comparePassword = async (password, storedPassword) => {
  const isTheSame = await bcrypt.compare(password, storedPassword);
  console.log(isTheSame);
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

//Här registrerar man atleten. Lägg in Email, namn och nyckel i databas
app.post("/admin/register", async (req, res) => {
  const newUser = req.body;
  console.log(newUser);
  let client

  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

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
  console.log(newUser);
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
  console.log(credentials);
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

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: 120000,
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
  let client
  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    const allUsers = await usersCollection.find().toArray();

    if (allUsers.length > 0) {
      res.status(200).json({ success: true, users: allUsers });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Inga användare hittades" });
    }
  } catch (error) {
    console.error("Error retrieving all users:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Ett fel inträffade vid hämtning av alla användare",
      });
  } finally {
    if (client) {
      releaseConnection()
    }
  }
});

app.post("/add-excercise", async (req, res) => {
  const newExercise = req.body;
  console.log(newExercise);
 let client
  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const exerciseCollection = database.collection("exercises");

    const exercise = await exerciseCollection.findOne({
      name: newExercise.name,
    });

    if (exercise) {
      return res.status(401).json({ error: "Övning finns redan" });
    }

    const result = await exerciseCollection.insertOne(newExercise);
    res
      .status(200)
      .json({ message: "Övning tillagd", exerciseId: result.insertedId });
  } catch (err) {
    console.error("Något gick fel, kunde inte spara övning", err);
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
});

app.get("/get-exercises", async (req, res) => {
  let client
  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const exerciseCollection = database.collection("exercises");

    const exercises = await exerciseCollection.find().toArray();

    res.status(200).json(exercises);
  } catch (err) {
    console.error("Error fetching exercises:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching exercises" });
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
});

app.post("/admin/post-global-message", async (req, res) => {
  const globalMessage = req.body;
  let client
  try {
    const database = client.db("Coachapp");
    const globalMessageCollection = database.collection("globalmessage");

    const existingMessage = await globalMessageCollection.findOne();

    if (existingMessage) {
      await globalMessageCollection.updateOne({}, { $set: globalMessage });
      res.status(200).json({ message: "Globalt meddelande uppdaterat" });
    } else {
      const result = await globalMessageCollection.insertOne(globalMessage);
      res
        .status(200)
        .json({
          message: "Globalt meddelande tillagt",
          messageId: result.insertedId,
        });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Något gick fel vid hantering av globalt meddelande" });
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
});

app.get("/get-global-message", async (req, res) => {
  let client
  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const globalMessageCollection = database.collection("globalmessage");
    const result = await globalMessageCollection.findOne();

    if (result) {
      res
        .status(200)
        .json({ message: "Globalt meddelande hämtat", globalMessage: result });
    } else {
      res.status(404).json({ message: "Inget globalt meddelande hittades" });
    }
  } catch (err) {
    console.error("Något gick fel vid hämtning av meddelande", err);
    res
      .status(500)
      .json({ error: "Något gick fel vid hämtning av meddelande" });
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
});


app.post("/post-session", async (req, res) => {
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
      releaseConnection()
    }
  }
})

app.post("/assign-session", async (req, res) => {
  const { email, session } = req.body; 
let client

  try {
    client = await getConnection()
    const database = client.db("Coachapp");
    const usersCollection = database.collection("users");

    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "Användaren hittades inte" });
    }

    // Lägg till hela sessionen i användarens sessions-array
    await usersCollection.updateOne(
      { email: email },
      { $push: { sessions: session } }
    );

    res.status(200).json({ message: "Träningspass tillagt till användaren" });
  } catch (error) {
    console.error("Fel vid tilldelning av träningspass:", error);
    res.status(500).json({ error: "Ett fel inträffade vid tilldelning av träningspass" });
  } finally {
    if (client) {
      releaseConnection(client)
    }
  }
});



app.listen(port, () => {
  console.log("Server running at port " + port);
});
