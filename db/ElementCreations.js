const mongoose = require("mongoose");

const ElementCreations = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  products: {
    type: String,
    required: true,
  },
  time: {
    type: String,
  },
  
});

exports.ElementCreations = mongoose.model(
  "elementcreation",
  ElementCreations
);
