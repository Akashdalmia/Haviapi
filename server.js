require("dotenv").config();
const express = require("express");
const app = express();
const ConnectDB = require("./db/Connection.js");
const bodyParser = require("body-parser");
const cors = require("cors");

const { User } = require("./db/User");
const { Registers } = require("./db/Register");
const { Password } = require("./db/Password");
const { Code } = require("./db/Code");
const { CodeNonUser } = require("./db/CodeNonUser");
const { ElementAssignment } = require("./db/ElementAssignment");
const { ElementProducts } = require("./db/Elementproducts");
const { Assignment } = require("./db/Assignment");
const { Welcomepage } = require("./db/Welcomepage");
const { Challenge } = require("./db/Challenge");
const { sendEmail } = require("./Email");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { CheckAssignment } = require("./db/CheckedAssignment.js");
app.use(cookieParser());
ConnectDB();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/save_data", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new User({
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    time: date_ob,
  });
  //console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.post("/save_element_data", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new ElementAssignment({
    title: req.body.title,
    url: req.body.url,
    time: date_ob,
  });
  //console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.post("/register_data", async (req, res) => {
  const user = await Registers.findOne({ email: req.body.email });
  if (user) {
    return res
      .status(400)
      .send({ success: false, message: "Email already in use" });
  }
  var register = new Registers({
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
    marks: "0",
  });
  const data = await register.save();
  const tokens = jwt.sign(
    { _id: data._id.toString() },
    process.env.SECRET_KEY,
    { expiresIn: "7200s" }
  );
  console.log("Data", data._id, tokens);

  if (data) {
    return res.status(200).json({ success: true, data: data, token: tokens });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "User doesn't exist" });
  }
});

app.put("/forgot_password", async (req, res) => {
  const user = await Registers.findOne({ email: req.body.email });
  const password = req.body.password;
  console.log(user, password);

  if (user) {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
        var data = new Registers({
          _id: user._id,
          email: req.body.email,
          password: hash,
          confirmpassword: hash,
        });
        Registers.updateOne({ _id: user._id }, data)
          .then(() => {
            res.status(200).json({ success: true, data: data });
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              data: data,
              message: "Email doesn't exist",
            });
          });
      });
    });
  } else {
    return res
      .status(400)
      .send({ success: false, message: "Email  doesn't exist" });
  }
});

// test

app.post("/login_data", async (req, res) => {
  try {
    const user = await Registers.findOne({ email: req.body.email });
    console.log("valid", user);
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "User doesn't exist" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    const token = await user.generateAuthToken();
    if (user.email === "admin@havi.co" && isMatch) {
      res.status(200).send({
        success: true,
        message: "Admin login successfully",
        token: token,
      });
    } else if (isMatch) {
      res
        .status(200)
        .send({ success: true, message: "User Authenticated", token: token });
    } else {
      res
        .status(400)
        .send({ success: false, message: "Email id or Password is wrong!" });
    }
  } catch (error) {
    res
      .status(400)
      .send({ success: false, message: "Email id or Password is wrong!" });
  }
});

app.put("/update_profile_data/:id", (req, res) => {
  const data = new Registers({
    _id: req.body.id,
    shortdesc: req.body.shortdesc,
    name: req.body.name,
    image: req.body.image,
    alternateemail: req.body.alternateemail,
    parentsname: req.body.parentsname,
    parentsemail: req.body.parentsemail,
  });
  //console.log(data);
  Registers.updateOne({ _id: req.body.id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.put("/update_profile_details/:id", async (req, res) => {
  const username = await Registers.findOne({ username: req.body.username });
  //console.log("valid", username);
  if (username) {
    return res.status(400).send({
      success: false,
      message: "This username is already in use, please try a different one",
    });
  }
  const data = new Registers({
    _id: req.body.id,
    name: req.body.name,
    parentsname: req.body.parentsname,
    contact: req.body.contact,
    username: req.body.username,
    shortdesc: req.body.shortdesc,
    image: req.body.image,
  });
  console.log(data);
  Registers.updateOne({ _id: req.body.id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.post("/subimt_assignment_data", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new Assignment({
    id: req.body.id,
    name: req.body.name,
    category: req.body.category,
    projectname: req.body.projectname,
    url: req.body.url,
    shortdesc: req.body.shortdesc,
    image: req.body.image,
    status: 1,
    time: date_ob,
  });
  // console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.post("/subimt_code_data", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new Code({
    id: req.body.id,
    name: req.body.name,
    category: req.body.category,
    projectname: req.body.projectname,
    url: req.body.url,
    shortdesc: req.body.shortdesc,
    image: req.body.image,
    status: 0,
    time: date_ob,
  });
  // console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.post(`/profile_get_data`, async (req, res) => {
  //console.log("decode", req.body.decoded)
  const data = await Registers.find({ _id: req.body.decoded });
  const Project = await Assignment.find({ id: req.body.decoded });
  const code = await Code.find({ id: req.body.decoded });
  const merge = Project.concat(code);
  const sort = merge.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  // console.log(sort);
  if ((data, sort)) {
    return res.status(200).json({ success: true, data: data, code: sort });
  }
  return res.status(400).json({ success: false, data: data, code: sort });
});

app.post(`/profile_data`, async (req, res) => {
  //console.log("decode", req.body.decoded)
  const data = await Registers.find({ username: req.body.decoded });
  const assignmentid = data[0]._id;
  const Project = await Assignment.find({ id: assignmentid });
  const code = await Code.find({ id: assignmentid });
  let publishcode = [];
  let publishproject = [];
  for (let i = 0; i < Project.length; i++) {
    if (Project[i].status === "1") {
      publishproject.push(Project[i]);
    }
  }

  for (let i = 0; i < code.length; i++) {
    if (code[i].status === "1") {
      publishcode.push(code[i]);
    }
  }
  const combine = publishproject.concat(publishcode);
  // console.log(typeof combine);

  const filter = combine.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  //console.log(filter);
  if ((data, filter)) {
    return res.status(200).json({ success: true, data: data, Project: filter });
  }
  return res.status(400).json({ success: false, data: data, Project: filter });
});

app.get(`/all_profile_data`, async (req, res) => {
  const user = await Registers.find();
  const project = await Assignment.find();
  filterArr = [];
  user.map((item) => {
    if (project.find((project) => project.id == item._id)) {
      filterArr.push(item);
      //console.log(filterArr);
    }
  });
  if (filterArr) {
    return res.status(200).json({ success: true, data: filterArr });
  }
  return res.status(400).json({ success: false, data: filterArr });
});

app.get(`/all_assignment`, async (req, res) => {
  const Project = await Assignment.find();
  if (Project) {
    return res.status(200).json({ success: true, data: Project });
  }
  return res.status(400).json({ success: false, data: Project });
});

app.put("/update_marks/:_id", async (req, res) => {
  const data = new Registers({
    _id: req.body.id,
    marks: req.body.marks,
  });

  Registers.updateOne({ _id: req.body.id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.get(`/all_profile_datas`, async (req, res) => {
  const user = await Registers.find();
  const project = await Assignment.find({ status: "1" });
  const code = await Code.find({ status: "1" });
  const merge = project.concat(code);
  filterArr = [];

  //  const updateddata = Code.updateMany(
  //    {},
  //    { category: "code" },
  //    { multi: true },
  //    function (err, numberAffected) {
  //      console.log(err);
  //    }
  //  );
  // console.log(updateddata);

  user.map((item) => {
    if (merge.find((merge) => merge.id == item._id)) {
      filterArr.push(item);
    }
  });
  const filter = filterArr.sort(function (a, b) {
    return parseFloat(a.marks) - parseFloat(b.marks);
  });
  const reversedata = filter.reverse();
  if (reversedata) {
    return res.status(200).json({ success: true, data: reversedata });
  }
  return res.status(400).json({ success: false, data: reversedata });
});

app.post("/save_code", async (req, res) => {
  console.log(req.body.uid);
  const userdetails = await Registers.findOne({ _id: req.body.uid });
  console.log(userdetails.name);
  const date_current = new Date().toLocaleString();
  console.log("Code save successfuly", req.body);
  var user = new Code({
    id: req.body.uid,
    category: "code",
    name: userdetails.name,
    url: req.body.url,
    projectname: req.body.pname,
    image: req.body.image,
    time: date_current,
    status: 0,
  });
  console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.post("/save_code_for_unuser", async (req, res) => {
  console.log(req.body);
  const date_current = new Date().toLocaleString();
  console.log("Code save successfuly", req.body);
  var user = new CodeNonUser({
    id: req.body.uid,
    category: "code",
    name: req.body.name,
    url: req.body.url,
    projectname: req.body.pname,
    image: req.body.image,
    time: date_current,
    status: 0,
  });
  console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.put("/updatefetchcode", async (req, res) => {
  const Userid = await Code.find({ id: req.body.id });
  const userurl = Userid.filter((u) => u.url == req.body.url);
  //console.log(userurl, "valid");
  if (userurl.length === 0) {
    return res
      .status(400)
      .send({ success: false, message: "url and id doesn't exist" });
  } else {
    var data = {
      _id: userurl[0]._id,
      id: req.body.id,
      url: req.body.url,
      projectname: userurl[0].projectname,
      image: req.body.image,
    };
    //console.log("data", data);
    Code.updateOne({ _id: userurl[0]._id }, data)
      .then(() => {
        res.status(200).json({
          success: true,
          data: data,
          message: "Updated!!!",
        });
        // console.log(" updated data", data);
      })
      .catch((error) => {
        res.status(400).json({
          success: false,
          data: data,
          message: "Failed!!!",
        });
      });
  }
});

app.post("/checkvaliduser", async (req, res) => {
  const Userid = await Code.find({ id: req.body.id });
  const userurl = Userid.filter((u) => u.url == req.body.url);
  //console.log(userurl, "valid");
  if (userurl.length === 0) {
    return res
      .status(400)
      .send({ success: false, message: "User is Valid!!!!" });
  } else {
    return res.status(200).send({ success: true, message: "Valid user!!!" });
  }
});

//aaaaaa

app.post("/checkforpresentproject", async (req, res) => {
  const Userid = await Code.find({ id: req.body.id });
  const userurl = Userid.filter((u) => u.projectname == req.body.pname);
  console.log(Userid, userurl, "valid", userurl.length);
  if (userurl.length === 0) {
    return res
      .status(400)
      .send({ success: false, message: "User is Valid!!!!" });
  } else {
    return res.status(200).send({ success: true, message: "Valid user!!!" });
  }
});

app.post("/checkprojectname", async (req, res) => {
  const Userunknownid = await CodeNonUser.find({ url: req.body.url });
  const Usercodeid = await Code.find({ url: req.body.url });
  if (Userunknownid.length !== 0) {
    if (Userunknownid[0].projectname === req.body.projectname) {
      return res.status(200).send({ success: true, data: Userunknownid });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "User is not Valid!!!!" });
    }
  } else if (Usercodeid.length !== 0) {
    if (Usercodeid[0].projectname === req.body.projectname) {
      return res.status(200).send({ success: true, data: Usercodeid });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "User is not Valid!!!!" });
    }
  } else {
    return res
      .status(400)
      .send({ success: false, message: "User is not Valid!!!!" });
  }
});

app.post("/checkcodeurl", async (req, res) => {
  const Userid = await Code.find({ url: req.body.url });
  console.log(Userid, "valid");
  if (Userid.length === 0) {
    return res
      .status(400)
      .send({ success: false, message: "url doesn't exist" });
  } else {
    return res
      .status(200)
      .send({ success: true, message: "url exist!!!", data: Userid });
  }
});

app.put("/updatecodename", async (req, res) => {
  const Userid = await Code.find({ url: req.body.url });
  console.log(Userid, "valid", Userid);
  console.log(req.body.projectname);
  const data = new Code({
    _id: Userid[0]._id,
    projectname: req.body.projectname,
  });
  Code.updateOne({ _id: Userid[0]._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.put("/updatecodenamenonuse", async (req, res) => {
  const Userid = await CodeNonUser.find({ url: req.body.url });
  console.log(Userid, "valid", Userid);
  console.log(req.body.projectname);
  const data = new CodeNonUser({
    _id: Userid[0]._id,
    projectname: req.body.projectname,
  });
  console.log("data", data);
  CodeNonUser.updateOne({ _id: Userid[0]._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.put("/publish_code:_id", async (req, res) => {
  const projects = await Assignment.find({ _id: req.body.id });
  const code = await Code.find({ _id: req.body.id });

  console.log("project", projects, "code", code);
  if (projects.length != 0) {
    const data = new Assignment({
      _id: req.body.id,
      status: req.body.status,
    });
    //console.log(data);
    Assignment.updateOne({ _id: req.body.id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else {
    const data = new Code({
      _id: req.body.id,
      status: req.body.status,
    });
    //console.log(data);
    Code.updateOne({ _id: req.body.id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  }
});

app.put("/publish_project:_id", (req, res) => {
  const data = new Assignment({
    _id: req.body.id,
    status: req.body.status,
  });
  console.log(data);
  Assignment.updateOne({ _id: req.body.id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.put("/updateprojectname", (req, res) => {
  const data = new Code({
    _id: req.body._id,
    projectname: req.body.projectname,
    shortdesc: req.body.description,
  });
  console.log(data);
  Code.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.put("/updateassignmentdetails", async (req, res) => {
  const projects = await Assignment.find({ _id: req.body._id });
  const code = await Code.find({ _id: req.body._id });
  if (projects.length != 0) {
    const data = new Assignment({
      _id: req.body._id,
      category: req.body.category,
      projectname: req.body.projectname,
      shortdesc: req.body.shortdesc,
      url: req.body.url,
      image: req.body.image,
    });
    console.log(data);
    Assignment.updateOne({ _id: req.body._id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else {
    const data = new Code({
      _id: req.body._id,
      category: req.body.category,
      projectname: req.body.projectname,
      shortdesc: req.body.shortdesc,
      url: req.body.url,
      image: req.body.image,
    });
    console.log(data);
    Code.updateOne({ _id: req.body._id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  }
});

app.put("/unpublish_code:_id", async (req, res) => {
  const projects = await Assignment.find({ _id: req.body.id });
  const code = await Code.find({ _id: req.body.id });
  if (projects.length != 0) {
    const data = new Assignment({
      _id: req.body.id,
      status: req.body.status,
    });
    Assignment.updateOne({ _id: req.body.id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else {
    const data = new Code({
      _id: req.body.id,
      status: req.body.status,
    });
    Code.updateOne({ _id: req.body.id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  }
});

app.put("/unpublish_project:_id", (req, res) => {
  const data = new Assignment({
    _id: req.body.id,
    status: req.body.status,
  });
  console.log(data);
  Assignment.updateOne({ _id: req.body.id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.put("/project_evaluated", async (req, res) => {
  console.log("body", req.body);
  const projects = await Assignment.find({ _id: req.body.id });
  const code = await Code.find({ _id: req.body.id });
  if (projects.length != 0) {
    console.log("projects");
    const data = new Assignment({
      _id: req.body.id,
      evaluated: req.body.evaluated,
    });
    console.log(data);
    Assignment.updateOne({ _id: req.body.id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else if (code.length != 0) {
    console.log("entered in code");
    const data = new Code({
      _id: req.body.id,
      evaluated: req.body.evaluated,
    });
    console.log(data);
    Code.updateOne({ _id: req.body.id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.put("/assign_points", async (req, res) => {
  console.log("body", req.body);
  const projects = await Assignment.find({ _id: req.body.id });
  const code = await Code.find({ _id: req.body.id });
  if (projects.length != 0) {
    console.log("projects");
    const data = new Assignment({
      _id: req.body.id,
      points: req.body.points,
    });
    console.log(data);
    Assignment.updateOne({ _id: req.body.id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else if (code.length != 0) {
    console.log("entered in code");
    const data = new Code({
      _id: req.body.id,
      points: req.body.points,
    });
    console.log(data);
    Code.updateOne({ _id: req.body.id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.put(`/total_points`, async (req, res) => {
  const projects = await Assignment.find({ id: req.body.id });
  const code = await Code.find({ id: req.body.id });
  // const codestatus = code.filter(function (hero) {
  //   return hero.status == "1";
  // });
  const merge = projects.concat(code);
  var total = [];
  var sum = 0;
  for (var i = 0; i < merge.length; i++) {
    const points = merge[i].points;
    if (points != undefined) {
      total.push(points);
    }
  }
  for (var i = 0; i < total.length; i++) {
    sum += total[i];
  }
  console.log(sum);
  const data = new Registers({
    _id: req.body.id,
    marks: sum,
  });
  console.log(data);
  Registers.updateOne({ _id: req.body.id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.put(`/check_eligibility`, async (req, res) => {
  const user = await Registers.find({ _id: req.body.id });
  const projects = await Assignment.find({ id: req.body.id });
  const code = await Code.find({ id: req.body.id });
  // const codestatus = code.filter(function (hero) {
  //   return hero.status == "1";
  // });
  // console.log(codestatus);
  const merge = projects.concat(code);
  console.log(merge.length);
  var total = [];
  var sum = 0;

  for (var i = 0; i < merge.length; i++) {
    const points = merge[i].points;
    if (points == undefined) {
      total.push(points);
    }
  }
  console.log("total", total.length);
  if (total.length >= 1) {
    return res.status(400).json({ success: false, data: user });
  } else {
    return res.status(200).json({ success: true, data: user });
  }
});

app.post("/send_email", async (req, res) => {
  console.log(req.body);
  sendEmail(req.body.email, req.body.name, req.body.marks, "marks");
});

app.get(`/all_project_data`, async (req, res) => {
  const projects = await Assignment.find();
  const code = await Code.find({});
  const merge = projects.concat(code);
  const project = merge.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  if (project) {
    return res.status(200).json({ success: true, data: project });
  }
  return res.status(400).json({ success: false, data: project });
});

app.get(`/all_project_nonusers_data`, async (req, res) => {
  const project = await CodeNonUser.find();

  const projects = project.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  if (projects) {
    return res.status(200).json({ success: true, data: projects });
  }
  return res.status(400).json({ success: false, data: projects });
});

app.get(`/all_project_datas`, async (req, res) => {
  const projects = await Assignment.find();
  const project = projects.reverse();
  if (project) {
    return res.status(200).json({ success: true, data: project });
  }
  return res.status(400).json({ success: false, data: project });
});

app.delete(`/delete_heroes_project`, async (req, res) => {
  console.log(req.body.id);
  const data = await Assignment.findByIdAndDelete(req.body.id);
  const code = await Code.findByIdAndDelete(req.body.id);
  console.log(data, code);
  if (data) {
    console.log("project");
    return res.status(200).json({ success: true, data: data });
  } else if (code) {
    console.log("code");
    console.log(code);
    return res.status(200).json({ success: true, data: code });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.delete(`/delete_unknown_heroes_project`, async (req, res) => {
  console.log(req.body.id);
  const data = await CodeNonUser.findByIdAndDelete(req.body.id);
  console.log(data);
  if (data) {
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.delete(`/delete_unknown_heroes_project123`, async (req, res) => {
  // console.log(req.body.id);
  const project = await CodeNonUser.find({ url: req.body.id });
  const data = await CodeNonUser.findByIdAndDelete(project._id);
  // console.log(data);
  if (data) {
    return res.status(200).json({ success: false, data: data });
  } else {
    return res.status(400).json({ success: true, data: data });
  }
});

app.delete(`/delete_heroes_bulkproject`, async (req, res) => {
  console.log(req.body.id);
  const data = req.body.id;
  Code.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
  Assignment.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
});

app.delete(`/delete_unknown_heroes_bulkproject`, async (req, res) => {
  console.log(req.body.id);
  const data = req.body.id;
  CodeNonUser.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
});

app.delete(`/delete_heroes_bulkdetails`, async (req, res) => {
  Registers.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
});

app.put("/update_heroes_project", async (req, res) => {
  console.log("body", req.body);
  const project = await Assignment.find({ _id: req.body._id });
  const code = await Code.find({ _id: req.body._id });
  console.log(project.length, code.length);
  if (project.length != 0) {
    console.log("enter project");
    const data = new Assignment({
      _id: req.body._id,
      name: req.body.name,
      projectname: req.body.projectname,
      url: req.body.url,
      points: req.body.points,
      image: req.body.image,
      shortdesc: req.body.shortdesc,
    });
    console.log(data);
    Assignment.updateOne({ _id: req.body._id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else if (code.length != 0) {
    console.log("enter in code");
    const data = new Code({
      _id: req.body._id,
      name: req.body.name,
      projectname: req.body.projectname,
      points: req.body.points,
      url: req.body.url,
      image: req.body.image,
    });
    console.log(data);
    Code.updateOne({ _id: req.body._id }, data)
      .then(() => {
        res.status(200).json({ success: true, data: data });
      })
      .catch((error) => {
        res.status(400).json({ success: false, data: data });
      });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.put("/update_unknown_heroes_project", async (req, res) => {
  console.log("body", req.body);
  const data = new CodeNonUser({
    _id: req.body._id,
    name: req.body.name,
    projectname: req.body.projectname,
    url: req.body.url,
  });
  console.log(data);
  CodeNonUser.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.post("/insert_password", async (req, res) => {
  var user = new Password({
    password: req.body.password,
  });
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.get(`/all_users_details`, async (req, res) => {
  const user = await Registers.find();
  const code = await Code.find();
  const project = await Assignment.find();
  const merge = project.concat(code);
  let userurl = [];
  let data = [];
  let finalvalues = [];
  // let setvalue;
  console.log(user.length);
  for (var i = 0; i <= user.length - 1; i++) {
    userurl[i] = merge.filter((u) => u.id == user[i]._id);
    data[i] = userurl[i].reverse();
    finalvalues[i] = data[i][0];
  }
  const users = user.reverse();
  // console.log(users)
  if ((users, finalvalues)) {
    return res
      .status(200)
      .json({ success: true, data: users, data1: finalvalues });
  }
  return res.status(400).json({ success: false, data: users });
});

app.put("/update_user_details", (req, res) => {
  const data = new Registers({
    _id: req.body._id,
    name: req.body.name,
    email: req.body.email,
    shortdesc: req.body.shortdesc,
    username: req.body.username,
  });
  console.log(data);
  Registers.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
      console.log(error);
    });
});

app.delete(`/delete_users_details`, async (req, res) => {
  const data = await Registers.findByIdAndDelete(req.body._id);
  const code = await Code.deleteMany({ id: req.body._id });
  const project = await Assignment.deleteMany({ id: req.body._id });
  console.log(data, code, project);
  if (data) {
    console.log("project");
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.get(`/topfivestudentdetails`, async (req, res) => {
  const user = await Registers.find();
  const filter = user.sort(function (a, b) {
    return parseFloat(a.marks) - parseFloat(b.marks);
  });
  const reversedata = filter.reverse();
  let data = [];
  for (let i = 0; i <= 4; i++) {
    data.push(reversedata[i]);
  }
  console.log(data, data.length);
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

//code---------------------------------------------------

//code---------------------------------------------

// element assignment
app.put("/check_assignment_status", async (req, res) => {
  const Userid = await CheckAssignment.find({ userid: req.body.userid });
  const userurl = Userid.filter((u) => u.assignmentid == req.body.assignmentid);
  console.log(
    Userid,
    "length",
    Userid.length,
    "valid",
    userurl,
    userurl.length
  );
  if (userurl.length === 0) {
    return res.status(400).send({ success: false, data: userurl });
  } else {
    return res.status(200).send({ success: true, data: userurl });
  }
});

app.put("/update_assignment_status", (req, res) => {
  const date_ob = new Date().toLocaleString();
  const data = new CheckAssignment({
    _id: req.body._id,
    assignmentid: req.body.assignmentid,
    userid: req.body.userid,
    status: req.body.status,
    time: date_ob,
  });
  //console.log(data);
  CheckAssignment.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.post("/insert_assignment_status", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new CheckAssignment({
    assignmentid: req.body.assignmentid,
    userid: req.body.userid,
    status: req.body.status,
    time: date_ob,
  });
  // console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.get(`/get_data`, async (req, res) => {
  // const data = await User.find().sort({ time: -1 }).limit();
  const data = await User.find();
  //console.log(data);
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.get(`/get_element_data`, async (req, res) => {
  const project = await ElementAssignment.find();
  // const data = project.sort(function (a, b) {
  //   return parseFloat(a.sequence) - parseFloat(b.sequence);
  // });
  //console.log(data);

  const data = project.sort(function (a, b) {
    return new Date(a.time) - new Date(b.time);
  });
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.post(`/get_assignment_status`, async (req, res) => {
  const data = await CheckAssignment.find({ userid: req.body.userid });
  let publishproject = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === "1") {
      publishproject.push(data[i].assignmentid);
    }
  }
  console.log(publishproject, publishproject.length);
  if (publishproject) {
    return res.status(200).json({ success: true, datas: publishproject });
  }
  return res.status(400).json({ success: false, datas: publishproject });
});

app.delete(`/delete_element_assignment`, async (req, res) => {
  const data = await User.findByIdAndDelete(req.body._id);
  if (data) {
    console.log("project");
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.delete(`/delete_element_assignment2`, async (req, res) => {
  const data = await ElementAssignment.findByIdAndDelete(req.body._id);
  if (data) {
    console.log("project");
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

//element................................

//############challenge##################

app.post("/create_challenge", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new Challenge({
    url: req.body.url,
    challengename: req.body.challengename,
    challengetype: req.body.challengetype,
    challengelimit: req.body.challengelimit,
    challengeguide: req.body.challengeguide,
    challengenexturl: req.body.challengenexturl,
    challengeprevurl: req.body.challengeprevurl,
    time: date_ob,
  });
  console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.get(`/get_challenges`, async (req, res) => {
  const challeng = await Challenge.find();
  const challenges = challeng.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  if (challenges) {
    return res.status(200).json({ success: true, data: challenges });
  }
  return res.status(400).json({ success: false, data: challenges });
});

app.put("/update_challenge", (req, res) => {
  const data = new Challenge({
    _id: req.body._id,
    url: req.body.url,
    challengename: req.body.challengename,
    challengetype: req.body.challengetype,
    challengelimit: req.body.challengelimit,
    challengeguide: req.body.challengeguide,
    challengenexturl: req.body.challengenexturl,
    challengeprevurl: req.body.challengeprevurl,
  });
  console.log(data);
  Challenge.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.delete(`/delete_challenge`, async (req, res) => {
  console.log(req.body.id);
  const data = await Challenge.findByIdAndDelete(req.body.id);
  console.log(data);
  if (data) {
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.delete(`/bulkdelete_challenge`, async (req, res) => {
  console.log(req.body.id);
  const data = req.body.id;
  Challenge.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
});

app.post("/get_challenge_credential", async (req, res) => {
  const challenge = await Challenge.find({ url: req.body.url });
  // const userurl = Userid.filter((u) => u.url == req.body.url);
  console.log(challenge, "valid");
  if (challenge.length === 1) {
    return res.status(200).send({
      success: true,
      data: challenge,
      message: "Challenge is there !!!!",
    });
  } else {
    return res.status(400).send({
      success: false,
      data: challenge,
      message: "NO challenge is there !!!!",
    });
  }
});

//---------challenge--------------------

//--------element display-----------------

app.get(`/elementdone`, async (req, res) => {
  const users = await Registers.find();
  const createdelement = await ElementAssignment.find();
  const doneelements = await CheckAssignment.find();

  for (let i = 0; i < doneelements.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (doneelements[i].userid == users[j]._id) {
        doneelements[i].userid = users[j].name;
      }
    }
  }
  for (let i = 0; i < doneelements.length; i++) {
    for (let j = 0; j < createdelement.length; j++) {
      if (doneelements[i].assignmentid == createdelement[j]._id) {
        doneelements[i].assignmentid = createdelement[j].title;
      }
    }
  }
  const usersdata = doneelements.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  console.log(usersdata);
  if (usersdata) {
    return res.status(200).json({ success: true, data: usersdata });
  }
  return res.status(400).json({ success: false, data: usersdata });
});

app.delete(`/delete_element_comeplete`, async (req, res) => {
  console.log(req.body.id);
  const data = await CheckAssignment.findByIdAndDelete(req.body.id);
  console.log(data);
  if (data) {
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.delete(`/delete_elemet_bulkproject`, async (req, res) => {
  console.log(req.body.id);
  const data = req.body.id;
  CheckAssignment.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
});
//-------- end element display-----------------

//-----------start welcomepage-------------------

app.post("/welcome_insert", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new Welcomepage({
    programname: req.body.name,
    type: req.body.type,
    url: req.body.url,
    image: req.body.image,
    time: date_ob,
  });
  console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.get(`/get_welcome`, async (req, res) => {
  const challeng = await Welcomepage.find();
  const challenges = challeng.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  if (challenges) {
    return res.status(200).json({ success: true, data: challenges });
  }
  return res.status(400).json({ success: false, data: challenges });
});

app.put("/update_welcome", (req, res) => {
  const data = new Welcomepage({
    _id: req.body._id,
    url: req.body.url,
    image: req.body.image,
    type: req.body.type,
    programname: req.body.programname,
  });
  console.log(data);
  Welcomepage.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.delete(`/delete_welcome`, async (req, res) => {
  console.log(req.body.id);
  const data = await Welcomepage.findByIdAndDelete(req.body.id);
  console.log(data);
  if (data) {
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.delete(`/bulkdelete_welcome`, async (req, res) => {
  console.log(req.body.id);
  const data = req.body.id;
  Welcomepage.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
});

app.get(`/get_display_welcome`, async (req, res) => {
  const challeng = await Welcomepage.find();
  const challenges = challeng.sort(function (a, b) {
    return new Date(a.time) - new Date(b.time);
  });
  var module = [];
  var challenge = [];
  for (var i = 0; i < challenges.length; i++) {
    if (challenges[i].type === "modules") {
      challenge.push(challenges[i]);
    } else {
      module.push(challenges[i]);
    }
  }

  console.log(module, challenge);
  if ((module, challenge)) {
    return res
      .status(200)
      .json({ success: true, data: module, data1: challenge });
  }
  return res
    .status(400)
    .json({ success: false, data: module, data1: challenge });
});

//-----------end welcomepage-------------------

//================ Start Element Product ==============

app.post("/save_element_product", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new ElementProducts({
    sno: req.body.sno,
    elementProduct: req.body.elementProduct,
    time: date_ob,
  });
  //console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.get(`/get_element_product`, async (req, res) => {
  // const data = await User.find().sort({ time: -1 }).limit();
  const data = await ElementProducts.find().sort({ time: -1 });
  //console.log(data);
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.put("/update_element_product", (req, res) => {
  const data = new ElementProducts({
    _id: req.body._id,
    sno: req.body.sno,
    elementProduct: req.body.elementProduct,
  });
  console.log(data);
  ElementProducts.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.delete(`/delete_element_product`, async (req, res) => {
  const data = await ElementProducts.findByIdAndDelete(req.body._id);
  if (data) {
    console.log("project");
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.delete(`/bulkdelete_elemet_product`, async (req, res) => {
  console.log("bb", req.body.id);
  const data = req.body.id;
  ElementProducts.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
});

//================End Element Product ==============

//================Start Element Creations ==============

app.post("/save_element_creations", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new ElementAssignment({
    title: req.body.title,
    url: req.body.url,
    products: req.body.products,
    time: date_ob,
  });
  //console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.post("/save_element_creations1", async (req, res) => {
  const date_ob = new Date().toLocaleString();
  var user = new ElementAssignment({
    title: req.body.title,
    url: req.body.url,
    products: req.body.products,
    time: date_ob,
    sequence: req.body.sequence,
  });
  //console.log(user);
  const data = await user.save();
  if (data) {
    return res.status(200).json({ success: true, data: data });
  }
  return res.status(400).json({ success: false, data: data });
});

app.get(`/get_element_creations`, async (req, res) => {
  const project = await ElementAssignment.find();
  const data = project.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  const product = await ElementProducts.find();
  //console.log(data);
  if ((data, product)) {
    return res
      .status(200)
      .json({ success: true, data: data, product: product });
  }
  return res.status(400).json({ success: false, data: data, product: product });
});

app.get(`/get_element_creations1`, async (req, res) => {
  const project = await ElementAssignment.find();
  // const data = project.sort(function (a, b) {
  //   return new Date(b.time) - new Date(a.time);
  // });
  const data = project.sort(function (a, b) {
    return parseFloat(a.sequence) - parseFloat(b.sequence);
  });
  const product = await ElementProducts.find();
  //console.log(data);
  if ((data, product)) {
    return res
      .status(200)
      .json({ success: true, data: data, product: product });
  }
  return res.status(400).json({ success: false, data: data, product: product });
});

app.put("/update_element_creations", (req, res) => {
  const data = new ElementAssignment({
    _id: req.body._id,
    title: req.body.title,
    url: req.body.url,
    products: req.body.products,
  });
  console.log(data);
  ElementAssignment.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});
app.put("/update_element_creations1", (req, res) => {
  const data = new ElementAssignment({
    _id: req.body._id,
    title: req.body.title,
    url: req.body.url,
    products: req.body.products,
    sequence: req.body.sequence,
  });
  console.log(data);
  ElementAssignment.updateOne({ _id: req.body._id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.delete(`/delete_element_creations`, async (req, res) => {
  const data = await ElementAssignment.findByIdAndDelete(req.body._id);
  if (data) {
    console.log("project");
    return res.status(200).json({ success: true, data: data });
  } else {
    return res.status(400).json({ success: false, data: data });
  }
});

app.delete(`/bulkdelete_elemet_creations`, async (req, res) => {
  console.log("bb", req.body.id);
  const data = req.body.id;
  ElementAssignment.deleteMany(
    {
      _id: {
        $in: req.body.id,
      },
    },
    function (err, code) {
      if (err) {
        return res.status(400).json({ success: false, data: code });
      } else {
        return res.status(200).json({ success: true, data: data });
      }
    }
  );
});

//================ End Element Creations ==============

//================ Stat User side elemenets ==============

app.get(`/get_product_list`, async (req, res) => {
  const product = await ElementProducts.find();
  if (product) {
    return res.status(200).json({ success: true, data: product });
  }
  return res.status(400).json({ success: false, data: product });
});

app.post(`/get_elementcreation_list`, async (req, res) => {
  console.log("body data", req.body.products);
  const product = await ElementAssignment.find();
  var filterdata = [];
  for (var i = 0; i < product.length; i++) {
    if (product[i].products === req.body.products) {
      filterdata.push(product[i]);
    }
  }
  console.log(product, "filtered data ", filterdata);
  if (product) {
    return res.status(200).json({ success: true, data: filterdata });
  }
  return res.status(400).json({ success: false, data: filterdata });
});

app.post(`/get_elementcreation_list1`, async (req, res) => {
  console.log("body data", req.body.products);
  const product = await ElementAssignment.find();
  var filterdata = [];
  for (var i = 0; i < product.length; i++) {
    if (product[i].products === req.body.products) {
      filterdata.push(product[i]);
    }
  }
  const filter = filterdata.sort(function (a, b) {
    return parseFloat(a.sequence) - parseFloat(b.sequence);
  });

  console.log(product, "filtered data ", filter);
  if (product) {
    return res.status(200).json({ success: true, data: filter });
  }
  return res.status(400).json({ success: false, data: filter });
});

//================ End  User side elemenets ==============

//==================== start profile visibility ==========

app.put("/update_profile_visibility", async (req, res) => {
  const data = new Registers({
    _id: req.body.id,
    profilevisibility: req.body.profilevisibility,
  });
  console.log("check visibility", data);
  Registers.updateOne({ _id: req.body.id }, data)
    .then(() => {
      res.status(200).json({ success: true, data: data });
    })
    .catch((error) => {
      res.status(400).json({ success: false, data: data });
    });
});

app.post(`/profile_get_datavisibility`, async (req, res) => {
  //console.log("decode", req.body.decoded)
  const data = await Registers.find({ _id: req.body.decoded });
  const Project = await Assignment.find({ id: req.body.decoded });
  const code = await Code.find({ id: req.body.decoded });

  const merge = Project.concat(code);
  const sort = merge.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  // console.log(sort);
  if ((data, sort)) {
    return res.status(200).json({ success: true, data: data, code: sort });
  }
  return res.status(400).json({ success: false, data: data, code: sort });
});

app.get(`/all_profile_datasss`, async (req, res) => {
  const user = await Registers.find();
  const project = await Assignment.find({ status: "1" });
  const code = await Code.find({ status: "1" });
  const merge = project.concat(code);
  filterArr = [];

  var filterdata = [];
  var usersdata = [];
  for (var i = 0; i < user.length; i++) {
    if (user[i].profilevisibility == "true") {
      filterdata.push(user[i]);
    } else {
      usersdata.push(user[i]);
    }
  }
  usersdata.map((item) => {
    if (merge.find((merge) => merge.id == item._id)) {
      filterArr.push(item);
    }
  });
  const filter = filterArr.sort(function (a, b) {
    return parseFloat(a.marks) - parseFloat(b.marks);
  });
  const reversedata = filter.reverse();
  if (reversedata) {
    return res.status(200).json({ success: true, data: reversedata });
  }
  return res.status(400).json({ success: false, data: reversedata });
});

app.post(`/profile_datass`, async (req, res) => {
  const data = await Registers.find({ username: req.body.decoded });
  if (data[0].profilevisibility == "true") {
    const profilevisibility = "This profile is private.";
    if (profilevisibility) {
      return res.status(200).json({
        success: true,
        profile: profilevisibility,
      });
    }
    return res
      .status(400)
      .json({ success: false, data: data, profile: profilevisibility });
  } else {
    const assignmentid = data[0]._id;
    const Project = await Assignment.find({ id: assignmentid });
    const code = await Code.find({ id: assignmentid });
    let publishcode = [];
    let publishproject = [];
    for (let i = 0; i < Project.length; i++) {
      if (Project[i].status === "1") {
        publishproject.push(Project[i]);
      }
    }
    for (let i = 0; i < code.length; i++) {
      if (code[i].status === "1") {
        publishcode.push(code[i]);
      }
    }
    const combine = publishproject.concat(publishcode);
    const filter = combine.sort(function (a, b) {
      return new Date(b.time) - new Date(a.time);
    });
    if ((data, filter)) {
      return res
        .status(200)
        .json({ success: true, data: data, Project: filter });
    }
    return res
      .status(400)
      .json({ success: false, data: data, Project: filter });
  }
});

//==================== End profile visibility ==========

app.use(express.json({ extended: false }));
app.get(`/`, async (req, res) => {
  res.status(200).json({ status: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`your application is running in ${PORT}`);
});
