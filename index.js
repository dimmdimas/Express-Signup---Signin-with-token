import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./DB.js";
import jwt from "jsonwebtoken";
import User from "./models/users.js";
import cors from "cors";
import { json } from "stream/consumers";

// Load environment variables
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set(
  "views",
  path.join(path.dirname(fileURLToPath(import.meta.url)), "views")
);

//DB Connection
connectDB();

// Variables
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Routes Page
app.get("/signup", async (req, res) => {
  res.render("signup");
});

app.get("/signin", async (req, res) => {
  res.render("signin");
});

app.get("/home/:token", async (req, res) => {
  const {token} = req.params;

  const {userId} = jwt.verify(token, JWT_SECRET);
  
  console.log(userId);
  console.log(token);

  const user = await User.findById(userId);

  console.log(user);

  res.render("home", {user});

})

// Routes signup
app.post("/signup", async (req, res) => {
  try {
    const { email, username, frist_name, last_name, password } = req.body;

    const emailValidate = await User.findOne({
      email,
    });

    const usernameValidate = await User.findOne({
      username,
    });

    // Validate Email & Username
    if (emailValidate || usernameValidate) {
      return res.status(411).json({
        message: "Email or Username already exists !",
      });
    }

    const newUser = new User({
      username: username,
      frist_name: frist_name,
      last_name: last_name,
      email: email,
      password: password,
    });

    // Hashing
    var hashedPassword = await newUser.createHash(newUser.password);
    newUser.password = hashedPassword;
    await newUser.save();

    const userId = newUser._id;

    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET
    );

    res
      .json({
        message: "User created successfully",
        token: token,
        data: newUser,
      })
      .status(201);
    // .render('signup', {newUser});

    console.log(newUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    username: username,
  });

  if (user && (await user.validatePassword(password))) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    res.json({
      token: token,
    });
    return;
    res.redirect(`/home/${token}`)
  } else {
    return res.status(400).json({
      message: "Incorrect Password !",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
