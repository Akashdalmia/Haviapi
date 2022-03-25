const mongoose = require("mongoose");

const ElementProduct = mongoose.Schema({
  sno: {
    type: String,
    required: true,
  },
  elementproduct: {
    type: String,
    required: true,
  },
  time: {
    type: String,
  },
});

exports.ElementProduct = mongoose.model(
  "elementproduct",
  ElementProduct
);
