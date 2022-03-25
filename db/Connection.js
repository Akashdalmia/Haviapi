// const mongoose = require('mongoose');

// const URL ="mongodb+srv://todo:todoDatabase@cluster0.m7q6e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// const ConnectDB = async ()=>{
//     await mongoose.connect(URL,{useNewUrlParser:true,useUnifiedTopology:true});
//     console.log("Database connected..");
// };

// module.exports = ConnectDB;



const mongoose = require('mongoose');

const URL ="mongodb+srv://haviUser:haviUser@cluster0.ein7g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const ConnectDB = async ()=>{
    await mongoose.connect(URL,{useNewUrlParser:true,useUnifiedTopology:true});
    console.log("Database connected..");
};

module.exports = ConnectDB;