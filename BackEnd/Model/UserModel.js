const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      // Password is required only for non-Google users
      return !this.googleId;
    }
  },
  phone: {
    type: String,
    default: ""
  },
  googleId: {
    type: String,
    default: null
  },
  profilePicture: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: "guest",
    enum: ["guest", "manager"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
