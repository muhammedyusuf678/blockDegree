var mongoose = require("mongoose");

var Degree = require("./models/degree")
var Student = require("./models/student")
var University = require("./models/university")
var Employer = require("./models/employer")


var dbFunctions = {
    findUniversityById: async function  (id, populateFlag=false, populateObject=""){
        function callback (err,foundUniversity){
            if(err) { 
                console.log (err);
                return false;
            }
            else {
                console.log("found University");
                console.log(foundUniversity);
                return foundUniversity;
            }
        }
        if(populateFlag) return await University.findById(id).populate(populateObject).exec(callback);
        else return await University.findById(id, callback)
    },
    findStudentById: async function  (id, populateFlag=false, populateObject="") {
        function callback (err,foundStudent){
            if(err) { 
                console.log (err);
                return false;
            }
            else {
                console.log("found Student");
                console.log(foundStudent);
                return foundStudent;
            }
        }
        if(populateFlag) return await Student.findById(id).populate(populateObject).exec(callback);
        else return await Student.findById(id, callback)
    },
    findDegreeById: async function (id) {
        return await Degree.findById(id, function(err,foundDegree){
            if(err) { 
                console.log (err);
                return false;
            }
            else {
                console.log("found Degree");
                console.log(foundDegree);
                return foundDegree;
            }
        })
    },
    findEmployerById: async function (id) {
        return await Employer.findById(id, function(err,foundEmployer){
            if(err) { 
                console.log (err);
                return false;
            }
            else {
                console.log("found Employer");
                console.log(foundEmployer);
                return foundEmployer;
            }
        })
    },
    findStudentByBlockDegreeEmail: async function  (email) {
        return (await Student.find({blockDegreeEmail: email}, function(err,resultSet){
            if(err) { 
                console.log (err);
            }
            else {
                console.log("found Student");
                console.log(resultSet[0]);
                return resultSet[0];
            }
        }))[0]
    },
    findEmployerByBlockDegreeEmail: async function  (email) {
        return (await Employer.find({blockDegreeEmail: email}, function(err,resultSet){
            if(err) { 
                console.log (err);
            }
            else {
                console.log("found Employer");
                console.log(resultSet[0]);
                return resultSet[0];
            }
        }))[0]
    }
}   

module.exports = dbFunctions