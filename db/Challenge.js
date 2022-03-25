const mongoose = require("mongoose");

const Challenge = mongoose.Schema({
  url: {
    type: String,
  },
  challengename: {
    type: String,
  },
  challengetype: {
    type: String,
  },
  challengelimit: {
    type: String,
  },
  challengeguide: {
    type: String,
  },
  challengenexturl: {
    type: String,
  },
  challengeprevurl: {
    type: String,
  },
  time: {
    type: String,
  },
});
exports.Challenge = mongoose.model("challenge", Challenge);
