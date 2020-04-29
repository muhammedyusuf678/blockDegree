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

var majorsList = require("./static_data/majors")
var degreeTypesList = require("./static_data/degreeTypes")

const dbFunctions = require("./dbFunctions")
const middleware = require("./middleware");

var flash = require("connect-flash");
app.use(flash());//before passport configuration

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
    res.locals.errorFlash = req.flash("error");
    res.locals.successFlash = req.flash("success");
    res.locals.currentUrl = req.originalUrl;
    next();
})

const hasher = require('node-object-hash')({ sort: true, coerce: true });

//--------------------

app.get("/", function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject);
    }
    res.render("index");
})

app.get("/test", function (req, res) {
    res.render("template")
})

app.get("/register", function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject);
    }
    res.render("register/index")
})

app.get("/register/student", function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject);
    }
    res.render("register/student")
})

app.get("/register/employer", function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject);
    }
    res.render("register/employer")
})

app.get("/register/university", function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject);
    }
    res.render("register/university")
})

app.post("/register/university", function (req, res) {
    console.log("post request received in /registerUniversity");
    req.flash("success", "Thank you for your interest in joining Blockdegree, "+req.body.representativeName+". We will get back to you within 5 working days")
    res.redirect("/");
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
            req.flash("error", "User registration failed. Please try again later")
            return res.render("register/index");
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
                            req.flash("error", "User registration failed. Please try again later")
                            return res.render("register/index");
                        }
                    })
                }
                else {
                    console.log("saved User:");
                    console.log(savedUser);
                    passport.authenticate("local")(req, res, function () {
                        req.flash("success", "Welcome to BlockDegree, " + savedStudent.name)
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
        sharesList: [],
        blockDegreeEmail: req.body.username
    }
    console.log(newEmployer)
    Employer.create(newEmployer, (err, savedEmployer) => {
        if (err) {
            console.log(err)
            req.flash("error", "User registration failed. Please try again later")
            return res.render("register/index");
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
                            req.flash("error", "User registration failed. Please try again later")
                            return res.render("register/index");
                        }
                    })
                }
                else {
                    console.log("saved User:");
                    console.log(savedUser);
                    passport.authenticate("local")(req, res, function () {
                        req.flash("success", "Welcome to BlockDegree, " + savedEmployer.employerName)
                        res.redirect("/employer/" + savedEmployer._id);
                    })
                }
            })
        }
    })
})

app.get("/login", function (req, res) {
    console.log("in login")
    if (req.isAuthenticated()) {
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject);
    }
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
    req.flash("success", "Logged Out Successfully!")
    res.redirect("/")
})

app.get("/university/:id", middleware.isLoggedIn, middleware.checkUserUniversityDashboard, async function (req, res) {
    res.render("universityDashboard", { university: req.university })
})


app.get("/university/:id/addDegree", middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
    var universityId = req.params.id;
    res.render("addDegree", { universityId: universityId, majors: majorsList, degreeTypes: degreeTypesList })
})

app.post("/university/:id/addDegree", middleware.isLoggedIn, middleware.checkUserUniversityDashboard, async function (req, res) {
    console.log("post request received in /addDegree");
    console.log(req.body)
    var studentEmail = req.body.student;
    var universityId = req.body.university;
    // var foundStudent = await dbFunctions.findStudentByBlockDegreeEmail(studentEmail);

    var foundUser = await dbFunctions.findUserByBlockDegreeEmail(studentEmail)
    if (!foundUser) {
        console.log("no such user exists");
        req.flash("error", "No such User exists")
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
    }
    if (foundUser.userType != 'Student') {
        console.log("degrees can only be awarded to student users")
        req.flash("error", "Degrees can only be awarded to student users!")
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
    }
    var foundStudent = await dbFunctions.findStudentById(foundUser.userObject);

    University.findById(universityId)
        .populate({
            path: 'registeredStudentsList.studentReference',
            model: 'Student'
        })
        .exec(function (err, foundUniversity) {
            if(err){
                console.log(err);
                req.flash("error", "Database Error: Could not create degree. Please try again later")
                res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
            }
            var foundRegistered = false;
            for (var i = 0; i < foundUniversity.registeredStudentsList.length; i++) {
                if (foundStudent._id.equals(foundUniversity.registeredStudentsList[i].studentReference.id)) {
                    foundRegistered = true;
                }
            }
            if (!foundRegistered) {
                console.log("degrees can only be awarded to students registered with your institution")
                console.log("The student specified is not registered with you")
                req.flash("error", "Degrees can only be awarded to students registered with your institution. The student specified is not registered with you")
                return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
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
                    req.flash("error", "Database Error: Could not create degree. Please try again later")
                    res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
                }
                else {
                    // console.log("saved dummy degree")
                    // console.log(savedDummyDegree)
                    await Degree.findOneAndUpdate({ _id: savedDummyDegree._id }, { $set: newDegree }, { new: true }, async function (err, savedFinalDegree) {
                        if (err) {
                            console.log(err);
                            req.flash("error", "Database Error: Could not create degree. Please try again later")
                            return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
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
                    req.flash("success", "New Degree Pushed to Blockchain and Awarded Successfully")
                    res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
                }
            })
        })
})


app.get("/university/:id/viewIssuedDegrees", middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
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


app.get("/university/:id/viewSharedDegrees", middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
    //async await
    console.log("get request recieved in viewSharedDegrees")
    var universityId = req.params.id;
    University.findById(universityId).populate("sharesList").exec(function (err, foundUniversity) {
        if (err) console.log(err);
        else {
            res.render("viewSharedDegrees", { university: foundUniversity })
        }
    })
})

app.get("/university/:id/viewAllStudents", middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
    //async await
    console.log("get request recieved in viewAllStudents")
    var universityId = req.params.id;
    University.findById(universityId)
        .populate({
            path: 'registeredStudentsList.studentReference',
            model: 'Student'
        })
        .exec(function (err, foundUniversity) {
            if (err) console.log(err);
            else {
                console.log(foundUniversity.registeredStudentsList)
                res.render("viewAllStudents", { university: foundUniversity })
            }
        })

    // .populate({ 
    //     path: 'pages',
    //     populate: {
    //       path: 'components',
    //       model: 'Component'
    //     } 
    //  })
})

//show degree
app.get("/degrees/:id", middleware.isLoggedIn, middleware.canViewDegree, async function (req, res) {
    console.log("get request recieved in /degrees/:id")
    var id = req.params.id;
    Degree.findById(id, function (err, foundDegree) {
        if (err) {
            console.log(err);
            req.flash('error', 'A database error occurred. Please try again later')
            return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
        }
        else {
            console.log("foundDegree in show degree route")
            // console.log(foundDegree);
            University.findById(foundDegree.university, function (err, foundUniversity) {
                if (err) {
                    console.log(err)
                    req.flash('error', 'A database error occurred. Please try again later')
                    return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
                }
                console.log("foundUniversity in show degree route")
                res.render("viewDegree", { degree: foundDegree, university: foundUniversity });
            })
        }
    })
})

app.get("/student/:id", middleware.isLoggedIn, middleware.checkUserStudentDashboard, function (req, res) {
    res.render("studentDashboard", { student: req.student })
})

app.get("/student/:id/registerWithUniversity", middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
    console.log("get request recieved in registerWithUniversity")
    University.find({}, function (err, foundUniversities) {
        if (err) {
            console.log(err);
            res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
        }
        else {
            Student.findById(req.params.id)
                .populate({
                    path: 'universitiesList.universityReference',
                    model: 'University'
                }).exec(function (err, foundStudent) {
                    if (err) {
                        console.log(err);
                        res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
                    }
                    else {
                        console.log("found student populated university list")
                        console.log(foundStudent);
                        res.render("registerWithUniversity", { allUniversities: foundUniversities, student: foundStudent })
                    }
                })
        }
    })
})

app.post("/student/:id/registerWithUniversity", middleware.isLoggedIn, middleware.checkUserDashboard, function (req, res) {
    console.log("post request recieved in registerWithUniversity");
    console.log(req.body);
    var selectedUniversity = req.body.university;
    var newRegisteredUniversityForStudent = {
        universityReference: selectedUniversity,
        studentUniversityEmail: req.body.studentUniversityEmail,
        verified: true
    }

    Student.findById(req.params.id)
        .populate({
            path: 'universitiesList.universityReference',
            model: 'University'
        }).exec(function (err, foundStudent) {
            if (err) {
                console.log(err);
                return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
            }
            for (var i = 0; i < foundStudent.universitiesList.length; i++) {
                if (foundStudent.universitiesList[i].universityReference._id == selectedUniversity) {
                    req.flash("error", "You are already registered with this university!")
                    return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
                }
            }
            foundStudent.universitiesList.push(newRegisteredUniversityForStudent);

            University.findById(selectedUniversity, function (err, foundUniversity) {
                if (err) {
                    console.log(err);
                    req.flash("error", "Database Error. Please try again later")
                    return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
                }
                console.log("foundUniversity in registerWithUniversity")
                foundUniversity.registeredStudentsList.push({
                    studentReference: foundStudent,
                    studentUniversityEmail: req.body.studentUniversityEmail
                });
                foundUniversity.save(function (err) {
                    if (err) {
                        console.log(err)
                        req.flash("error", "Database Error. Please try again later")
                        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
                    }
                    console.log("added new registered student to university");
                    foundStudent.save(function (err) {
                        if (err) {
                            console.log(err)
                            req.flash("error", "Database Error. Please try again later")
                            return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
                        }
                        console.log("updated student with new university entry");
                        req.flash("success", "A verification email has been sent to your university email for verification")
                        res.redirect("/student/" + foundStudent._id + "/registerWithUniversity")
                    })
                })
            })
        })
})

app.get("/degrees/:id/share", middleware.isLoggedIn, middleware.canShareRevoke, async function (req, res) {
    var id = req.params.id;
    var foundDegree = req.degree;
    await Student.findById(foundDegree.student)
        .populate("sharesList.degree")
        .populate("sharesList.sharedWith")
        // model: "sharesList.userType"
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
                        console.log(share);
                        return share;
                    }
                })
                res.render("shareDegree", { degree: foundDegree, sharesList: relevantShares })
            }
        })
})

app.post("/degrees/:id/share", middleware.isLoggedIn, middleware.canShareRevoke, async function (req, res) {
    console.log("post request recieved in /shareDegree ")
    var blockDegreeEmail = req.body.blockDegreeEmail;
    var degreeID = req.params.id;
    var foundDegree = req.degree;
    var foundStudent = await dbFunctions.findStudentById(foundDegree.student)
    var foundUser = await dbFunctions.findUserByBlockDegreeEmail(blockDegreeEmail);
    if (!foundUser) {
        console.log("no such user exists");
        req.flash("error", "No such user exists!")
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
    }
    if (foundUser.userType == 'Student') {
        console.log("degrees can only be shared with employer or university accounts")
        req.flash("error", "Degrees can only be shared with employer or university accounts")
        return res.redirect("/" + req.user.userType.toLowerCase() + "/" + req.user.userObject)
    }

    var accountToShareWith;
    if (foundUser.userType == 'Employer') {
        accountToShareWith = await dbFunctions.findEmployerById(foundUser.userObject);
    }
    else if (foundUser.userType == 'University') {
        accountToShareWith = await dbFunctions.findUniversityById(foundUser.userObject);
    }

    await foundStudent.sharesList.push({
        degree: foundDegree,
        userType: foundUser.userType,
        sharedWith: accountToShareWith
    })

    await accountToShareWith.sharesList.push(foundDegree);

    await foundStudent.save(function (err) {
        if (err) console.log(err);
        else console.log("saved student");
    })

    await accountToShareWith.save(function (err) {
        if (err) console.log(err);
        else {
            console.log("saved accountToShareWith")
            req.flash("success", "Degree shared successfully!")
            res.redirect("/degrees/" + degreeID + "/share");
        }
    })
})

app.get("/degrees/:id/revoke/:sharedWithId", middleware.isLoggedIn, middleware.canShareRevoke, async function (req, res) {
    console.log("***********")
    console.log("post request recieved in /revokeDegree ")
    var degreeId = req.params.id;
    var sharedWithId = req.params.sharedWithId;

    //unexpanded/unpopulated.
    var foundDegree = req.degree;

    var foundSharedWith;
    Student.findById(foundDegree.student)
        .populate("sharesList.degree")
        .populate("sharesList.sharedWith")
        // .populate({
        //     path: 'sharesList.degree',
        //     model: 'Degree'
        // })
        // .populate({
        //     path: "sharesList.employer",
        //     model: "Employer"
        // })
        .exec(async function (err, foundStudent) {
            if (err) console.log(err)
            else {
                console.log("found student in /revokeDegree");
                console.log(foundStudent);

                var sharedWithUserType;
                foundStudent.sharesList = foundStudent.sharesList.filter(function (share) {
                    if (!((String(share.degree._id) == String(degreeId)) && (String(share.sharedWith._id) == String(sharedWithId)))) {
                        return share;
                    }
                    else {
                        sharedWithUserType = share.userType //only executed once for the match
                    }
                })

                if (sharedWithUserType === 'Employer') {
                    foundSharedWith = await dbFunctions.findEmployerById(sharedWithId);
                }
                else if (sharedWithUserType === 'University') {
                    foundSharedWith = await dbFunctions.findUniversityById(sharedWithId);
                }
                foundSharedWith.sharesList = foundSharedWith.sharesList.filter(function (degree) {
                    if (String(degree) != String(degreeId)) {
                        return degree;
                    }
                })

                await foundSharedWith.save(function (err) {
                    if (err) console.log(err)
                    else {
                        console.log("saved foundSharedWith");
                        console.log(foundSharedWith)
                    }
                })

                await foundStudent.save(function (err) {
                    if (err) console.log(err)
                    else {
                        console.log("saved student")
                        console.log(foundStudent);
                        req.flash("success", "Degree unshared!")
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