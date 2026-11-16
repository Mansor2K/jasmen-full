const auth = require("../model/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const validator = require("validator");
const User = require("../model/user");
require("dotenv").config();


const register = async (req, res) => {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.password, salt);
  const email = req.body.email;

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const adduser = new auth({
    email: req.body.email,
    SearchEmail: req.body.email,
    password: hash,
    userName: req.body.userName,
    isAdmin: req.body.isAdmin,
    token: "",
  });

  try {
    const emailexist = await auth.findOne({ email });

    if (emailexist) {
      return res.status(401).json("email already exist");
    }
    const saveduser = await adduser.save();
    res.status(201).json(saveduser);
  } catch (error) {
    res.status(400).json(error);
  }
};


const login = async (req, res) => {
  try {
    let user = await auth.findOne({ email: req.body.email });
    if (!user) {
      user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(404).json({ msg: "email not valid" });
      }

    }

    const isPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isPassword) {
      return res.status(401).json({ msg: "password not valid" });
    }

    // Check if the user already has a token
    let token;
    if (user.token && user.token !== "") {
      token = user.token;  // Use the existing token
    } else {
      // Generate a new token if none exists
      token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.kEY_ENCRYPT);
      user.token = token;
      await user.save();
    }

    const { __v, password, isAdmin, SearchEmail, ...other } = user._doc;
    res
      .header("access_token", token)
      .send({ role: "authenticated", user: other });

  } catch (error) {
    return res.status(400).json({ msg: "error in login" });
  }
};


const logOut = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID and update the token
    const updatedUser = await auth.findByIdAndUpdate(
      id,
      { token: "" },
      { new: true } // Returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Token reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const verfiyUser = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const user = await auth.findOne({ token });

    if (!user) {
      return res.status(404).json({ role: "not authenticated" });
    }
    const { __v, updatedAt, isAdmin, password, ...other } = user._doc;

    res.status(200).json({ role: "authenticated", other });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};



module.exports = { login, register, logOut, verfiyUser };
