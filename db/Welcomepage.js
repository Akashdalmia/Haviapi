const mongoose = require("mongoose");

const Welcomepage = mongoose.Schema({
  programname: {
    type: String,
  },
  type: {
    type: String,
  },
  url: {
    type: String,
  },
  image: {
    type: String,
  },
  time: {
    type: String,
  },
});

exports.Welcomepage = mongoose.model("welcomepage", Welcomepage);
