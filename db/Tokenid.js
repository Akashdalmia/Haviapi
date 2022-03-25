const mongoose = require("mongoose");

const Tokenid = mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});
exports.Tokenid = mongoose.model("token_id", Tokenid);
