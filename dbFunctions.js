var mongoose = require("mongoose");

var Degree = require("./models/degree")
var Student = require("./models/student")
var University = require("./models/university")


var dbFunctions = {
    findUniversityById: async function  (id){
        return await University.findById(id, function(err,foundUniversity){
            if(err) { 
                console.log (err);
                return false;
            }
            else {
                console.log("found University");
                console.log(foundUniversity);
                return foundUniversity;
            }
        })
    },
    findStudentById: async function  (id) {
        return await Student.findById(id, function(err,foundStudent){
            if(err) { 
                console.log (err);
                return false;
            }
            else {
                console.log("found Student");
                console.log(foundStudent);
                return foundStudent;
            }
        })
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
    }
}   

module.exports = dbFunctions