const mongoose = require("mongoose");

const Code = mongoose.Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
  },
  projectname: {
    type: String,
  },
  shortdesc: {
    type: String,
  },
  url: {
    type: String,
  },
  status: {
    type: String,
  },
  evaluated: {
    type: String,
  },
  points: {
    type: Number,
  },
  time: {
    type: String,
  },
});
exports.Code = mongoose.model("code", Code);
