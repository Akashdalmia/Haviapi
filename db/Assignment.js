const mongoose = require("mongoose");

const Assignment = mongoose.Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  category: {
    type: String,
  },
  image: {
    type: String,
  },
  projectname: {
    type: String,
  },
  url: {
    type: String,
  },
  shortdesc: {
    type: String,
  },
  evaluated: {
    type: String,
  },
  status: {
    type: String,
  },
  points: {
    type: Number,
  },
  time: {
    type: String,
  },
});
exports.Assignment = mongoose.model("assignment", Assignment);
