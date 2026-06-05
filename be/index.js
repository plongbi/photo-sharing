require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const multer = require("multer");
const path = require("path");

const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const Photo = require("./db/photoModel");

dbConnect();

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// app.options("*", cors());

app.use(express.json());

/* =========================
   SESSION
========================= */

app.set("trust proxy", 1);

app.use(
  session({
    secret: "photo-sharing-secret-key",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
    },
  })
);

/* =========================
   STATIC IMAGES
========================= */

app.use("/images", express.static(path.join(__dirname, "images")));

/* =========================
   MULTER
========================= */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./images/");
  },
  filename(req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, unique + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Photo Sharing API Running",
  });
});

/* =========================
   TEST SESSION
========================= */

app.get("/test-session", (req, res) => {
  res.json({
    sessionUser: req.session.user_id || null,
  });
});

/* =========================
   USER LIST
========================= */

app.get("/user/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");

    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   USER DETAIL
========================= */

app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({
      message: "Invalid User ID",
    });
  }
});

/* =========================
   USER PHOTOS
========================= */

app.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find({
      user_id: req.params.id,
    }).populate("comments.user_id", "_id first_name last_name");

    const formattedPhotos = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: photo.comments.map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id,
      })),
    }));

    res.json(formattedPhotos);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   REGISTER
========================= */

app.post("/user", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      login_name: req.body.login_name,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Login name already exists",
      });
    }

    const user = new User(req.body);

    await user.save();

    res.json({
      _id: user._id,
      login_name: user.login_name,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   LOGIN
========================= */

app.post("/admin/login", async (req, res) => {
  try {
    const { login_name, password } = req.body;

    const user = await User.findOne({
      login_name,
    });

    if (!user || user.password !== password) {
      return res.status(400).json({
        message: "Invalid login",
      });
    }

    req.session.user_id = user._id;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          message: "Session save failed",
        });
      }

      res.json({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        login_name: user.login_name,
      });
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   LOGOUT
========================= */

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({
      message: "Logged out",
    });
  });
});

/* =========================
   ADD COMMENT
========================= */

app.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const photo = await Photo.findById(req.params.photo_id);

    if (!photo) {
      return res.status(404).json({
        message: "Photo not found",
      });
    }

    photo.comments.push({
      comment: req.body.comment,
      user_id: req.session.user_id,
      date_time: new Date(),
    });

    await photo.save();

    res.json({
      message: "Comment added",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   UPLOAD PHOTO
========================= */

app.post("/photos/new", upload.single("photo"), async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const photo = new Photo({
      file_name: req.file.filename,
      user_id: req.session.user_id,
      comments: [],
      date_time: new Date(),
    });

    await photo.save();

    res.json({
      message: "Photo uploaded",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   START
========================= */

app.listen(8081, () => {
  console.log("Server running on port 8081");
});
