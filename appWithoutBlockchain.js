var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

//auth config before db connection
var passport = require("passport")
var localStrategy = require("passport-local")
var expressSession = require("express-session");
//------------

mongoose.connect("mongodb://localhost:27017/block_degree", { useNewUrlParser: true, useUnifiedTopology: true });

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var User = require("./models/user")
var Degree = require("./models/degree")
var Student = require("./models/student")
var University = require("./models/university")
var Employer = require("./models/employer")

const dbFunctions = require("./dbFunctions")
const middleware = require("./middleware");

//--------------------auth config
app.use(expressSession({
    secret: "Boku no hero academia is an amazing shonen",
    resave: false,
    saveUninitialized: false
}));
//Passport Configuration
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})
//--------------------

app.get("/", function (req, res) {
    res.render("index");
})

app.get("/register", function (req, res) {
    res.render("register/index")
})

app.get("/register/student", function (req, res) {
    res.render("register/student")
})

app.get("/register/employer", function (req, res) {
    res.render("register/employer")
})

app.post("/register/student", function (req, res) {
    console.log("post request received in /registerStudent");
    console.log(req.body);
    var newStudent = {
        name: req.body.name,
        contactNumber: req.body.contactNumber,
        universitiesList: [],
        degreesList: [],
        sharesList: [],
        blockDegreeEmail: req.body.username
    }
    Student.create(newStudent, (err, savedStudent) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log("successfully added new student: ");
            console.log(savedStudent);
            var newUser = new User({
                username: req.body.username,
                userType: 'Student',
                userObject: savedStudent._id
            });
            User.register(newUser, req.body.password, function (err, savedUser) {
                if (err) {
                    console.log(err);
                    //short circuit get out of callback
                    Student.findOneAndDelete({ _id: savedStudent._id }, function (err) {
                        if (err) console.log(err);
                        else {
                            console.log("user registration failed -- deleted student")
                            return res.render("register/index");
                        }
                    })
                }
                else {
                    console.log("saved User:");
                    console.log(savedUser);
                    passport.authenticate("local")(req, res, function () {
                        res.redirect("/student/" + savedStudent._id);
                    })
                }
            })
        }
    })
})

app.post("/register/employer", function (req, res) {
    console.log("post request received in /registerEmployer");
    console.log(req.body);
    var newEmployer = {
        employerName: req.body.employerName,
        companyName: req.body.companyName,
        location: req.body.location,
        contactNumber: req.body.contactNumber,
        sharesList: []
    }
    console.log(newEmployer)
    Employer.create(newEmployer, (err, savedEmployer) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log("successfully added new employer: ");
            console.log(savedEmployer);
            var newUser = new User({
                username: req.body.username,
                userType: 'Employer',
                userObject: savedEmployer._id
            });
            User.register(newUser, req.body.password, function (err, savedUser) {
                if (err) {
                    console.log(err);
                    //short circuit get out of callback
                    Employer.findOneAndDelete({ _id: savedEmployer._id }, function (err) {
                        if (err) console.log(err);
                        else {
                            console.log("user registration failed -- deleted employer")
                            return res.render("register/index");
                        }
                    })
                }
                else {
                    console.log("saved User:");
                    console.log(savedUser);
                    passport.authenticate("local")(req, res, function () {
                        res.redirect("/employer/" + savedEmployer._id);
                    })
                }
            })
        }
    })
})

app.get("/login", function (req, res) {
    res.render("login");
})

app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login"
}), function (req, res) {
    switch (req.user.userType) {
        case 'Student':
            res.redirect("/student/" + req.user.userObject)
            break;
        case 'Employer':
            res.redirect("/employer/" + req.user.userObject)
            break;
        case 'University':
            res.redirect("/university/" + req.user.userObject)
            break;
    }
})

//logout route
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/")
})

app.get("/university/:id", middleware.isLoggedIn, middleware.checkUserUniversityDashboard, async function (req, res) {
    res.render("universityDashboard", { university: req.university })
})


app.get("/university/:id/addDegree", middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
    var universityId = req.params.id;
    res.render("addDegree", { universityId: universityId })
})

app.post("/university/:id/addDegree", middleware.isLoggedIn, middleware.checkUserUniversityDashboard, async function (req, res) {
    console.log("post request received in /addDegree");
    var studentEmail = req.body.student;
    var universityId = req.body.university;
    // var foundStudent = await dbFunctions.findStudentByBlockDegreeEmail(studentEmail);

    var foundUser = await dbFunctions.findUserByBlockDegreeEmail(studentEmail)
    if(!foundUser){
        console.log("no such user exists");
        return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
    }
    if(foundUser.userType != 'Student'){
        console.log("degrees can only be awarded to student users")
        return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
    }
    var foundStudent = await dbFunctions.findStudentById(foundUser.userObject);

    // console.log("foundStudent in addDegree")
    // console.log(foundStudent);
    var foundUniversity = req.university;
    // console.log("foundUniversity in addDegree")
    // console.log(foundUniversity);

    var foundRegistered = false;
    for (var i = 0; i <foundUniversity.registeredStudentsList.length; i++){
        if(foundStudent._id.equals(foundUniversity.registeredStudentsList[i])){
            foundRegistered = true;
        }
    }
    if(!foundRegistered){
        console.log("degrees can only be awarded to students registered with your institution")
        console.log("the student specified is not registered with you")
        return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
    }
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
            res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
        }
    })
})


app.get("/university/:id/viewIssuedDegrees",middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
    //async await
    console.log("get request recieved in viewIssuedDegrees")
    var universityId = req.params.id;
    University.findById(universityId).populate("issuedDegrees").exec(function (err, foundUniversity) {
        if (err) console.log(err);
        else {
            res.render("viewIssuedDegrees", { university: foundUniversity })
        }
    })

})

app.get("/university/:id/viewAllStudents", middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
    //async await
    console.log("get request recieved in viewAllStudents")
    var universityId = req.params.id;
    University.findById(universityId).populate("registeredStudentsList").exec(function (err, foundUniversity) {
        if (err) console.log(err);
        else {
            res.render("viewAllStudents", { university: foundUniversity })
        }
    })
})

//show degree
app.get("/degrees/:id", middleware.isLoggedIn, middleware.canViewDegree, async function (req, res) {
    console.log("get request recieved in /degrees/:id")
    var id = req.params.id;
    Degree.findById(id, async function (err, foundDegree) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("foundDegree in show degree route")
            console.log(foundDegree);

            res.render("viewDegree", { degree: foundDegree });
        }
    })
})

app.get("/student/:id", middleware.isLoggedIn, middleware.checkUserStudentDashboard, function (req, res) {
    res.render("studentDashboard", { student: req.student })
})

app.get("/degrees/:id/share", middleware.isLoggedIn, middleware.canShareRevoke, async function (req, res) {
    var id = req.params.id;
    var foundDegree = req.degree;
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

app.post("/degrees/:id/share",middleware.isLoggedIn, middleware.canShareRevoke, async function (req, res) {
    console.log("post request recieved in /shareDegree ")
    var blockDegreeEmail = req.body.blockDegreeEmail;
    var degreeID = req.params.id;
    var foundDegree = req.degree;
    var foundStudent = await dbFunctions.findStudentById(foundDegree.student)
    var foundUser = await dbFunctions.findUserByBlockDegreeEmail(blockDegreeEmail);
    if(!foundUser){
        console.log("no such user exists");
        return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
    }
    if(foundUser.userType != 'Employer'){
        console.log("degrees can only be shared with employer users")
        return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
    }
    var foundEmployer = await dbFunctions.findEmployerById(foundUser.userObject);

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

app.get("/degrees/:id/revoke/:employerid", middleware.isLoggedIn, middleware.canShareRevoke,async function (req, res) {
    console.log("***********")
    console.log("post request recieved in /revokeDegree ")
    var degreeId = req.params.id;
    var employerId = req.params.employerid;

    //unexpanded/unpopulated.
    var foundDegree = req.degree;
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
})

//EMPLOYER
app.get("/employer/:id", middleware.isLoggedIn, middleware.checkUserEmployerDashboard, function (req, res) {
    res.render("employerDashboard", { employer: req.employer })
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