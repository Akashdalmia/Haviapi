const mongoose = require('mongoose');

const User =  mongoose.Schema({
    title:{
        type:String,required:true
    },
    description:{
        type:String,required:true
    },
    image:{
        type:String
    },
    time:{
        type:String
    },
    status:{
        type:String
    }
})


exports.User = mongoose.model('user', User);
