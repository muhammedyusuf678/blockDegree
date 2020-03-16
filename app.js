var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/block_degree", { useNewUrlParser: true, useUnifiedTopology: true });

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var Degree = require("./models/degree")
var Student = require("./models/student")
var University = require("./models/university")

const dbFunctions = require("./dbFunctions")

const { EnrollAdmin } = require("./enrollAdmin");
const { RegisterUser } = require("./registerUser");

const { LoadContract } = require("./loadContract");
const { CreateDegree, QueryDegree } = require("./sdkAPI");

var contract;

// (async () => {
//     await EnrollAdmin();
//     console.log("done enroll admin");
//     await RegisterUser();
//     console.log("done register user");
//     contract = await LoadContract();
//     console.log("done loading smart contract");
//     addedToBlockchain = await CreateDegree(contract, "mufasa")
//     console.log("added to blockchain" + addedToBlockchain.toString())
//     console.log("done adding something to blockchain")
// })();


app.get("/", function (req, res) {
    //find returns a resultSet array
    //findById returns one document
    University.find({ universityName: "American University of Sharjah" })
        .populate("issuedDegrees")
        .populate("registeredStudentsList")
        .exec(function (err, resultSet) {
            if (err) console.log(err);
            else {
                console.log("found University");
                res.render("universityDashboard", { university: resultSet[0] })
            }
        });
})

app.get("/student/:id", function (req, res) {
    var id = req.params.id;
    Student.findById(id).populate("degreesList").exec(function (err, foundStudent) {
        if (err) {
            console.log(err)
        }
        else {
            console.log("found student: " + foundStudent);
            res.render("studentDashboard", { student: foundStudent })
        }
    })
})

app.get("/registerStudent", function (req, res) {
    res.render("registerStudent")
})

app.post("/registerStudent", function (req, res) {
    console.log("post request received in /addStudent");

    var newStudent = {
        ...req.body,
        universitiesList: [],
        degreesList: [],
        sharesList: []
    }

    Student.create(newStudent, (err, savedStudent) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log("successfully added new student: " + savedStudent);
            res.redirect("/student/" + savedStudent._id);
        }
    })

})

app.post("/addDegree", async function (req, res) {
    console.log("post request received in /addDegree");
    var studentEmail = req.body.student;
    var universityId = req.body.university;
    var foundStudent = await dbFunctions.findStudentByBlockDegreeEmail(studentEmail);
    console.log("foundStudent in addDegree")
    console.log(foundStudent);
    var foundUniversity = await dbFunctions.findUniversityById(universityId);
    console.log("foundUniversity in addDegree")
    console.log(foundUniversity);
    var newDegree = {
        ...req.body,
        university: foundUniversity,//stored as object references
        student: foundStudent,
        universityName: foundUniversity.universityName,
        studentName: foundStudent.name
    }
    console.log("new degree");
    console.log(newDegree);

    var dummyDegree = {
        university: mongoose.Types.ObjectId(),
        student: mongoose.Types.ObjectId(),
        studentName: 'dummy',
        universityName: 'dummy',
        studentUniversityEmail: 'dummy',
        college: 'dummy',
        major: 'dummy',
        degreeType: 'dummy',
        cgpa: 0,
        honors: 'dummy',
        issueDate: new Date(),
        universityName: 'dummy'
    }
    Degree.create(dummyDegree, async function (err, savedDummyDegree) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("saved dummy degree")
            console.log(savedDummyDegree)
            console.log("newDegree is: ")
            console.log({ ...newDegree, _id: String(savedDummyDegree._id) })
            //addedToBlockchain = await CreateDegree(contract, "mufasa")
            //console.log(addedToBlockchain)
            //console.log("degree added to blockchain")
            await Degree.findOneAndUpdate({ _id: savedDummyDegree._id }, { $set: newDegree }, { new: true }, async function (err, savedFinalDegree) {
                if (err) {
                    console.log(err);
                }
                console.log("final degree saved: " + savedFinalDegree);
                foundStudent.degreesList.push(savedFinalDegree);
                foundStudent.save(function (err) {
                    if (err) console.log(err)
                });
                foundUniversity.issuedDegrees.push(savedFinalDegree);
                foundUniversity.save(function (err) {
                    if (err) console.log(err)
                });
            })
            res.redirect("/");
        }
    })
})

//show degree
app.get("/degrees/:id", function (req, res) {
    console.log("get request recieved in /degrees/:id")
    var id = req.params.id;
    Degree.findById(id, function (err, foundDegree) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("viewDegree", { degree: foundDegree });
        }
    })
})

app.get("/degrees/:id/share", function (req, res) {
    var id = req.params.id;
    Degree.findById(id, function (err, foundDegree) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("shareDegree", { degree: foundDegree })
        }
    })
})


app.post("/queryBlockchain", async function (req, res) {
    // var key = req.body.key;
    // console.log("GET request received in queryBlockchain")
    // console.log(key)
    // var result = await QueryDegree(contract, key);
    // console.log("query blockchain result");
    // console.log(result.toString())
    // res.send(result);
})

app.listen(4001, function (req, res) {
    console.log("server listening on port 4001")
})