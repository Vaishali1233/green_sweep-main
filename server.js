

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const path = require("path"); // Import the path module
// const User = require('./path-to-user-model'); // Replace with the actual path to your User model file

const app = express();
const port = 3000;

app.use(bodyParser.json());
// Add this line before your route handlers
app.use(express.static(path.join(__dirname, 'image')));


mongoose.connect("mongodb://localhost:27017/mongo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  points: { type: Number, default: 0 }, // Add the points field
});

const User = mongoose.model("User", userSchema);


const exampleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    username: { type: String, required: true }, // Make sure it's defined as String
    image: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    timestamp: { type: Date, default: Date.now },
});

const ExampleModel = mongoose.model("Example", exampleSchema);


app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username, password: password });

    if (user) {
      res.json({ message: "Login successful", username: user.username });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User registration endpoint
// User registration endpoint
// User registration endpoint
app.post("/register", async (req, res) => {
    try {
      const { username, password, email, phone } = req.body;
  
      // Check if the username already exists
      const existingUser = await User.findOne({ username: username });
  
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
  
      const newUser = new User({
        username: username,
        password: password,
        email: email,
        phone: phone || null, // Set phone to null if not provided
        points: 0,
      });
  
      await newUser.save();
  
      res.json({ success: true, redirect: "/login.html" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
app.get("/landing.html", async (req, res) => {
  try {
    const username = req.query.username;
    const user = await User.findOne({ username: username });

    if (user) {
      res.sendFile(path.join(__dirname, "landing.html"));
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/get-user-data", async (req, res) => {
  try {
    const username = req.query.username;
    const user = await User.findOne({ username: username });

    if (user) {
      res.json({ username: user.username, points: user.points });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/add-data", upload.single("image"), async (req, res) => {
    try {
      const { name, category, username } = req.body;
      const imagePath = req.file ? req.file.path : "";
      const { latitude, longitude, points } = req.body;  // Extract points from the request body
  
      const newData = new ExampleModel({
        name: name,
        category: category,
        username: username,
        image: imagePath,
        latitude: latitude,
        longitude: longitude,
      });
  
      await newData.save();
      
const user = await User.findOne({ username: username });

if (user) {
    // Check if points is a valid number
    if (!isNaN(points)) {
        user.points = user.points ? user.points + parseInt(points) : parseInt(points);
        await user.save();
    } else {
        console.error("Invalid points value:", points);
    }
} else {
    console.error("User not found for points update.");
}

  
      res.json({ message: "Data added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

app.get("/get-all-entries", async (req, res) => {
  try {
    const allEntries = await ExampleModel.find();
    res.json(allEntries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-recent-entry", async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    const recentEntry = await ExampleModel.findOne({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    })
      .sort({ timestamp: -1 })
      .limit(1);

    const count = await ExampleModel.countDocuments({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    res.json({
      image: recentEntry ? recentEntry.image : "",
      count: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/map.html", (req, res) => {
  res.sendFile(path.join(__dirname, "map.html"));
});

// app.get("/landing.html", (req, res) => {
//   res.sendFile(path.join(__dirname, "landing.html"));
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});