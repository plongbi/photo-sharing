require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const multer = require("multer");
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel.js");
const Photo = require("./db/photoModel.js");

dbConnect();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: "photo-sharing-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    },
  })
);
app.use("/images", express.static("images"));
// app.use("/api/user", UserRouter);
// app.use("/api/photo", PhotoRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});

app.get("/user/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );
    if (!user) return res.status(400).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid User ID" });
  }
});

app.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find(
      { user_id: req.params.id },
      "_id user_id comments file_name date_time"
    ).populate("comments.user_id", "_id first_name last_name");

    if (!photos) return res.status(400).json({ error: "Invalid User ID" });

    const formattedPhotos = JSON.parse(JSON.stringify(photos)).map((photo) => {
      photo.comments = photo.comments.map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id,
      }));
      return photo;
    });

    res.status(200).json(formattedPhotos);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

// User Registration
app.post("/user", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
  
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).json({ message: "Login name already exists" });
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    await newUser.save();
    res.status(200).json({ _id: newUser._id, login_name: newUser.login_name });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

// User Login
app.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password) {
    return res.status(400).json({ message: "Login name and password are required" });
  }

  try {
    const user = await User.findOne({ login_name });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid login name or password" });
    }

    req.session.user_id = user._id;
    
    res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// User Logout
app.post("/admin/logout", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).json({ message: "Not logged in" });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// Add Comment to Photo
app.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({ message: "Unauthorized: Please log in first" });
  }

  const { comment } = req.body;
  if (!comment || !comment.trim()) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) {
      return res.status(400).json({ message: "Photo not found" });
    }

    const newComment = {
      comment: comment,
      user_id: req.session.user_id,
      date_time: new Date(),
    };

    photo.comments.push(newComment);
    await photo.save();

    res.status(200).json({ message: "Comment added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

// Upload Photo
app.post("/photos/new", upload.single("photo"), async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({ message: "Unauthorized: Please log in first" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const newPhoto = new Photo({
      file_name: req.file.filename,
      user_id: req.session.user_id,
      comments: [],
      date_time: new Date(),
    });

    await newPhoto.save();
    res.status(200).json({ message: "Photo uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving photo info", error: err.message });
  }
});
