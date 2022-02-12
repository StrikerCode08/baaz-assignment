const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    maxlength: [40, "name should be between 40 characters"],
  },
  username: {
    type: String,
    required: [true, "Please Provide a username"],
    minlength: [3, "username shulod be between 2 and 25"],
    maxlength: [25, "username shulod be between 2 and 25"],
    unique: true,
  },
  logo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please Provide a password"],
    minlength: [6, "Password should be atleast 6 character"],
  },
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
