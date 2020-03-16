var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// var crypto = require("crypto");//built-in nodejs
// var hash = md5sum.update(JSON.stringify(savedDegree)).digest("hex");


mongoose.connect("mongodb://localhost:27017/block_degree", { useNewUrlParser: true, useUnifiedTopology: true });

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//var md5sum = crypto.createHash("md5")


var Degree = require("./models/degree")

const { EnrollAdmin } = require("./enrollAdmin");
const { RegisterUser } = require("./registerUser");
//const { DoQuery } = require("./query");
//const { DoInvoke } = require("./invoke");

const { LoadContract } = require("./loadContract");
const { CreateDegree, QueryDegree } = require("./sdkAPI");

var contract;

(async () => {
    await EnrollAdmin();
    console.log("done enroll admin");
    await RegisterUser();
    console.log("done register user");
    contract = await LoadContract();
    console.log("done loading smart contract");
})();


app.get("/", function (req, res) {
    Degree.find({}, function (err, allDegrees) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("universityDashboard", { degrees: allDegrees });
        }
    })
})

app.post("/addDegree", function (req, res) {
    console.log("post request received in /addDegree");
    console.log(req.body);
    //create dummy object
    var studentUniversityId = req.body.studentUniversityID;
    var newDegree = {
        ...req.body,
        universityName: "AUS"
    }
    var dummyDegree = {
        studentBlockDegreeEmail: 'dummy',
        studentName: 'dummy',
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
            console.log("saved dummy degree to db");
            newDegree._id = savedDummyDegree._id;
            try {
                await CreateDegree(contract, newDegree)

                MyModel.findOneAndUpdate({ '_id': dummyDegree._id }, newDegree, function (err, savedFinalDegree) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("final degree saved to db: "+savedFinalDegree);
                        res.redirect("/");
                    }
                });
            }
            catch (error) {
                console.log("error invoking CreateDegree from chaincode: " + error)
            }
        }
    })
})

            //_id is location in db --> to be used as blockchain key

// are these routes and functions async by default
// app.get("/queryBlockchain", async function (req, res) {
//     console.log("GET request received in /queryBlockchain");
//     let queryResult = await DoQuery();
//     res.send(queryResult);
// })

// app.get("/invokeChaincode", async function (req, res) {
//     console.log("GET request received in /invokeChaincode");
//     let invokeResult = await DoInvoke();
//     res.send(invokeResult);
// })



app.listen(4001, function (req, res) {
    console.log("server listening on port 4001")
})