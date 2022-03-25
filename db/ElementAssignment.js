const mongoose = require("mongoose");

const ElementAssignment = mongoose.Schema({
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

exports.ElementAssignment = mongoose.model("elementassignment", ElementAssignment);
