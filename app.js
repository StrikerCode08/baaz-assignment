const express = require("express");
const app = express();
const User = require("./model/user");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const bcrypt = require("bcryptjs");
const fileUpload = require("express-fileupload");

//regular middleware
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

app.post("/register", async (req, res) => {
  try {
    const { username, name, password } = req.body;

    if (!(username && password && name)) {
      res.status(400).send("All fields are required");
    }
    const existingUser = await User.findOne({ username }); // PROMISE
    if (existingUser) {
      res.status(401).send("User already exists");
    }
    // const logo = req.files.logo;
    // let path = __dirname + "/images" + Date.now() + ".jpg";
    // logo.mv(path, (err) => {
    //   res.send(true);
    // });
    const myEncPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      name,
      password: myEncPassword,
    });

    //token
    const token = jwt.sign({ user_id: user._id }, process.env.SECRECT_KEY, {
      expiresIn: "1h",
    });
    user.token = token;
    //update or not in DB

    // handle password situation
    user.password = undefined;

    // send token or send just success yes and redirect - choice
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      res.status(400).send("Field is missing");
    }

    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.SECRECT_KEY,
        {
          expiresIn: "1h",
        }
      );
      user.token = token;
      user.password = undefined;
      // res.status(200).json(user);

      // if you want to use cookies
      const options = {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user,
      });
    }

    res.sendStatus(400).send("Username or password is incorrect");
  } catch (error) {
    console.log(error);
  }
});

app.post("/resetpassword", auth, async (req, res) => {
  const { username, newpassword } = req.body;
  const user = await User.findOne({ username });

  const myEncPassword = await bcrypt.hash(newpassword, 12);
  await user.findOneAndUpdate({ username }, { password: myEncPassword });
});

app.get("/getinfo", auth, async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
