const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const Registers = mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  confirmpassword: {
    type: String,
  },
  image: {
    type: String,
  },
  shortdesc: {
    type: String,
  },
  parentsname: {
    type: String,
  },
  parentsemail: {
    type: String,
  },
  alternateemail: {
    type: String,
  },
  marks: {
    type: String,
  },
});


Registers.methods.generateAuthToken = async function(){
    try{
        console.log(this._id)
        const token = jwt.sign(
          { _id: this._id.toString() },
          process.env.SECRET_KEY,
          { expiresIn: "7200s" }
        );
        return token;
    }
    catch(error){
        res.send("the error part " + error);
        console.log("the error part " + error);
    }
}

Registers.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.confirmpassword = await bcrypt.hash(this.password,10);     
    }
    next();
})



exports.Registers = mongoose.model('register', Registers);
