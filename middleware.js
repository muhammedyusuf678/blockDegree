const dbFunctions = require("./dbFunctions")
var University = require("./models/university")
var Student = require("./models/student")
var Degree = require("./models/degree")
var Employer = require("./models/employer")

module.exports = {
    isLoggedIn: function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        //must be immediately before redirect
        //have to handle in template and route
        //lets u add some data one-time to a page 
        req.flash("error","Please Login First!");
        res.redirect("/login");
    },
    checkUserUniversityDashboard: function(req,res,next){
        console.log("in checkUserUniversityDashboard")
        University.findById(req.params.id, function(err,foundUniversity){
            if(err || !foundUniversity){
                console.log("foundUniversity is undefined or does not exist");
                res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
            else if (foundUniversity._id.equals(req.user.userObject)){
                req.university = foundUniversity;
                next();
            }
            else {
                console.log("this is someone elses dashboard");
                res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
        })
    },
    checkUserStudentDashboard: function(req,res,next){
        console.log("in checkUserStudentDashboard")
        Student.findById(req.params.id).populate("degreesList").exec(function (err, foundStudent) {
            if(err || !foundStudent){
                console.log("foundStudent is undefined or does not exist");
                res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
            else if (foundStudent._id.equals(req.user.userObject)){
                req.student = foundStudent;
                next();
            }
            else {
                console.log("this is someone elses dashboard");
                res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
        })
    },
    checkUserEmployerDashboard: function(req,res,next){
        console.log("in checkUserEmployerDashboard")
        Employer.findById(req.params.id).populate("sharesList").exec(function (err, foundEmployer) {
            if(err || !foundEmployer){
                console.log("foundEmployer is undefined or does not exist");
                res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
            else if (foundEmployer._id.equals(req.user.userObject)){
                req.employer = foundEmployer;
                next();
            }
            else {
                console.log("this is someone elses dashboard");
                res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
        })
    },
    checkUserDashboard: function(req,res,next){
        console.log("in checkUserDashboard")
        if(req.user.userObject.toString() === req.params.id){
            next();
        }
        else {
            console.log("this is someone elses dashboard");
            res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
        }
    },
    canViewDegree: function(req,res,next){
        console.log("in canViewDegree")
        Degree.findById(req.params.id, async function (err, foundDegree) {
            if (err || !foundDegree) {
                console.log("foundDegree is undefined or does not exist");
                return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
            switch (req.user.userType){
                case 'Student':
                    //belongs to logged in student
                    if(req.user.userObject.equals(foundDegree.student)){
                        next();
                    }
                    else {
                        console.log("this is someone elses degree");
                        res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
                    }
                    break;
                case 'University':
                    if(req.user.userObject.equals(foundDegree.university)){
                        return next();
                    }
                    University.findById(req.user.userObject,function(err,foundUniversity){
                        if(err){
                            console.log(err);
                            console.log("some error occurred");
                            return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
                        }
                        for (var i = 0;i<foundUniversity.sharesList.length;i++){
                            if(foundDegree._id.equals(foundUniversity.sharesList[i])){
                                return next();
                            }
                        }
                        console.log("this degree was not awarded by your institution or has not been shared with you by the student")
                        return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject) 
                    })

                    break;
                case 'Employer':
                    Employer.findById(req.user.userObject,function(err,foundEmployer){
                        if(err){
                            console.log(err);
                            console.log("some error occurred");
                            return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
                        }
                        for (var i = 0;i<foundEmployer.sharesList.length;i++){
                            if(foundDegree._id.equals(foundEmployer.sharesList[i])){
                                return next();
                            }
                        }
                        console.log("this degree has not been shared with you by the student")
                        return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject) 
                    })
            }
        })
    },
    canShareRevoke: function(req,res,next){
        if(!(req.user.userType === 'Student')){
            console.log("this functionality is only available for the student")
            return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject) 
        }
        Degree.findById(req.params.id, async function (err, foundDegree) {
            if (err || !foundDegree) {
                console.log("foundDegree is undefined or does not exist");
                return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
            if(foundDegree.student.equals(req.user.userObject)){
                req.degree = foundDegree;
                next();
            }
            else {
                console.log("this is someone elses degree")
                return res.redirect("/"+req.user.userType.toLowerCase()+"/"+req.user.userObject)
            }
        })

    }
}