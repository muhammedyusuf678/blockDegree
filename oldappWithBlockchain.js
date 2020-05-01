var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/block_degree", { useNewUrlParser: true, useUnifiedTopology: true });

const hasher = require('node-object-hash')({ sort: true, coerce: true });


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var Degree = require("./models/degree")
var Student = require("./models/student")
var University = require("./models/university")
var Employer = require("./models/employer")


const dbFunctions = require("./dbFunctions")

const { EnrollAdmin } = require("./enrollAdmin");
const { RegisterUser } = require("./registerUser");

const { LoadContract } = require("./loadContract");
const { CreateDegree, QueryDegree } = require("./sdkAPI");

var contract;

var seedDegree =
{
    university: mongoose.Types.ObjectId(),
    student: mongoose.Types.ObjectId(),
    studentName: "Muhammed Yusuf",
    universityName: "American University of Sharjah",
    studentUniversityEmail: "b00068047@aus.edu",
    college: "College of Engineering",
    major: "Computer Science",
    cgpa: 3.5,
    honors: "Magna Cum Laude",
    degreeType: "Bachelor of Science",
    issueDate: new Date(),
    _id: mongoose.Types.ObjectId()
}

var testFunction = async () => {
    await EnrollAdmin();
    console.log("done enroll admin");
    await RegisterUser();
    console.log("done register user");
    contract = await LoadContract();
    console.log("done loading smart contract");
    console.log("adding dummy data to blockchain");
    console.log(JSON.parse(JSON.stringify(seedDegree)));
    var addedToBlockchain = await CreateDegree(contract, JSON.stringify(seedDegree))
    console.log("result from invoke blockchain")
    console.log(JSON.parse(addedToBlockchain.toString()))
    console.log("done adding degree to blockchain")
    var queryResult = await QueryDegree(contract, String(seedDegree._id));
    var queryResultJSON = JSON.parse(queryResult.toString())
    console.log("query blockchain result:");
    console.log(queryResultJSON)

    const hashString = hasher.hash(JSON.parse(JSON.stringify(seedDegree)))
    console.log("server hashing result: " + hashString)
    console.log("are they equal: " + String(hashString == queryResultJSON.hash))
};

testFunction();


app.get("/", function (req, res) {
    //find returns a resultSet array
    //findById returns one document
    University.find({ universityName: "American University of Sharjah" })
        .populate("issuedDegrees")
        .populate("registeredStudentsList")
        .exec(function (err, resultSet) {
            if (err) console.log(err);
            else {
                // console.log("found University");
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
            // console.log("found student: " + foundStudent);
            res.render("studentDashboard", { student: foundStudent })
        }
    })
})

app.get("/employer/:id", function (req, res) {
    var id = req.params.id;
    Employer.findById(id).populate("sharesList").exec(function (err, foundEmployer) {
        if (err) console.log(err);
        else {
            // console.log("found employer");
            // console.log(foundEmployer);
            res.render("employerDashboard", { employer: foundEmployer })
        }
    })
})

app.get("/registerStudent", function (req, res) {
    res.render("registerStudent")
})

app.get("/registerEmployer", function (req, res) {
    res.render("registerEmployer")
})

app.post("/registerStudent", function (req, res) {
    console.log("post request received in /registerStudent");
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

app.post("/registerEmployer", function (req, res) {
    console.log("post request received in /registerEmployer");
    var newEmployer = {
        ...req.body,
        sharesList: []
    }
    console.log(newEmployer)
    Employer.create(newEmployer, (err, savedEmployer) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log("successfully added new employer: " + savedEmployer);
            res.redirect("/employer/" + savedEmployer._id);
        }
    })
})

app.post("/addDegree", async function (req, res) {
    console.log("post request received in /addDegree");
    var studentEmail = req.body.student;
    var universityId = req.body.university;
    var foundStudent = await dbFunctions.findStudentByBlockDegreeEmail(studentEmail);
    // console.log("foundStudent in addDegree")
    // console.log(foundStudent);
    var foundUniversity = await dbFunctions.findUniversityById(universityId);
    // console.log("foundUniversity in addDegree")
    // console.log(foundUniversity);
    var newDegree = {
        ...req.body,
        university: foundUniversity._id,//stored as object references
        student: foundStudent._id,
        universityName: foundUniversity.universityName,
        studentName: foundStudent.name
    }
    // console.log("new degree");
    // console.log(newDegree);

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
        issueDate: req.body.issueDate,
        universityName: 'dummy'
    }
    Degree.create(dummyDegree, async function (err, savedDummyDegree) {
        if (err) {
            console.log(err);
        }
        else {
            // console.log("saved dummy degree")
            // console.log(savedDummyDegree)
            var sentToBlockchain = {
                ...newDegree,
                _id: savedDummyDegree._id,
                issueDate: savedDummyDegree.issueDate//mongo date formatting applied
            }
            console.log("data sent to blockchain");
            console.log(sentToBlockchain);
            var addedToBlockchain = await CreateDegree(contract,JSON.stringify(sentToBlockchain))
            console.log("result from invoke blockchain")
            console.log(JSON.parse(addedToBlockchain.toString()))
            console.log("done adding degree to blockchain")
            await Degree.findOneAndUpdate({ _id: savedDummyDegree._id }, { $set: newDegree }, { new: true }, async function (err, savedFinalDegree) {
                if (err) {
                    console.log(err);
                }
                console.log("final degree saved to DB: " + savedFinalDegree);
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
app.get("/degrees/:id", async function (req, res) {
    console.log("get request recieved in /degrees/:id")
    var id = req.params.id;
    Degree.findById(id, async function (err, foundDegree) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("foundDegree in show degree route")
            console.log(foundDegree);

            console.log("QUERYING BLOCKCHAIN");
            var queryResult = await QueryDegree(contract, String(foundDegree._id));
            var queryResultJSON = JSON.parse(queryResult.toString())
            console.log("query blockchain result:");
            console.log(queryResultJSON)

            //hashing object from mongodb
            console.log("server hashing: ");
            console.log(foundDegree)
            const hashString = hasher.hash(JSON.parse(JSON.stringify(foundDegree)))
            console.log("server hashing result: " + String(hashString))
            if (hashString.toString() == queryResultJSON.hash) {
                console.log("HASHES MATCH")
                res.render("viewDegree", { degree: foundDegree });
            } else {
                res.send("hashes dont match")
            }
        }
    })
})

app.get("/degrees/:id/share", async function (req, res) {
    var id = req.params.id;
    var foundDegree = await dbFunctions.findDegreeById(id);
    await Student.findById(foundDegree.student)
        .populate({
            path: 'sharesList.degree',
            model: 'Degree'
        })
        .populate({
            path: "sharesList.employer",
            model: "Employer"
        })
        .exec(function (err, foundStudent) {
            if (err) console.log(err);
            else {
                // console.log("*******")
                // console.log(foundDegree);
                // console.log(foundStudent);
                // console.log(foundStudent.sharesList[0].employer)
                // console.log(foundStudent.sharesList[0].degree)

                var relevantShares = foundStudent.sharesList.filter(function (share) {
                    // console.log(share)
                    if (String(share.degree._id) == String(foundDegree._id)) {
                        return share;
                    }
                })
                res.render("shareDegree", { degree: foundDegree, sharesList: relevantShares })
            }
        })
})

app.get("/degrees/:id/revoke/:employerid", async function (req, res) {
    console.log("***********")
    console.log("post request recieved in /revokeDegree ")
    var degreeId = req.params.id;
    var employerId = req.params.employerid;

    //unexpanded/unpopulated.
    var foundDegree = await dbFunctions.findDegreeById(degreeId);
    var foundEmployer = await dbFunctions.findEmployerById(employerId);
    Student.findById(foundDegree.student)
        .populate({
            path: 'sharesList.degree',
            model: 'Degree'
        })
        .populate({
            path: "sharesList.employer",
            model: "Employer"
        })
        .exec(async function (err, foundStudent) {
            if (err) console.log(err)
            else {
                console.log("found student in /revokeDegree");
                console.log(foundStudent);
                foundEmployer.sharesList = foundEmployer.sharesList.filter(function (degree) {
                    if (String(degree) != String(degreeId)) {
                        return degree;
                    }
                })

                foundStudent.sharesList = foundStudent.sharesList.filter(function (share) {
                    if (!((String(share.degree._id) == String(degreeId)) && (String(share.employer._id) == String(employerId)))) {
                        return share;
                    }
                })

                await foundEmployer.save(function (err) {
                    if (err) console.log(err)
                    else {
                        console.log("saved employer");
                        console.log(foundEmployer)
                    }
                })

                await foundStudent.save(function (err) {
                    if (err) console.log(err)
                    else {
                        console.log("saved student")
                        console.log(foundStudent);
                        res.redirect("/degrees/" + degreeId + "/share");
                    }
                })
            }
        })

    // await (async () => {

    // })();

})

app.post("/degrees/:id/share", async function (req, res) {
    console.log("post request recieved in /shareDegree ")
    var blockDegreeEmail = req.body.blockDegreeEmail;
    var degreeID = req.params.id;
    var foundDegree = await dbFunctions.findDegreeById(degreeID);
    var foundStudent = await dbFunctions.findStudentById(foundDegree.student)
    var foundEmployer = await dbFunctions.findEmployerByBlockDegreeEmail(blockDegreeEmail);

    await foundStudent.sharesList.push({
        degree: foundDegree,
        employer: foundEmployer
    })

    await foundEmployer.sharesList.push(foundDegree);

    await foundStudent.save(function (err) {
        if (err) console.log(err);
        else console.log("saved student");
    })

    await foundEmployer.save(function (err) {
        if (err) console.log(err);
        else {
            console.log("saved Employer")
            res.redirect("/degrees/" + degreeID + "/share");
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