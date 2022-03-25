const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Password = mongoose.Schema({
  password: {
    type: String,
  },
});


Password.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

exports.Password = mongoose.model("password", Password);
