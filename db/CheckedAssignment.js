const mongoose = require("mongoose");

const CheckAssignment = mongoose.Schema({
  assignmentid: {
    type: String,
  },
  userid: {
    type: String,
  },
  time: {
    type: String,
  },
  status: {
    type: String,
  },
});

exports.CheckAssignment = mongoose.model("checkassignment", CheckAssignment);
