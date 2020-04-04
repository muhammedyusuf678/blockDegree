var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/block_degree", { useNewUrlParser: true, useUnifiedTopology: true });

var User = require("./models/user");
var University = require("./models/university");
var Student = require("./models/student");
var Degree = require("./models/degree");
var Employer = require("./models/employer")
async function removeAll() {
    await University.remove({}, function (err) {
        if (err)
            console.log(err);
        else {
            console.log("removed universities");
        }
    })

    await Student.remove({}, function (err) {
        if (err) console.log(err);
        else {
            console.log("removed students");
        }
    })
    await Degree.remove({}, function (err) {
        if (err) console.log(err);
        else {
            console.log("removed degrees");
        }
    })
    await Employer.remove({}, function (err) {
        if (err) console.log(err);
        else {
            console.log("removed employers");
        }
    })

    await User.remove({}, function (err) {
        if (err) console.log(err);
        else {
            console.log("removed users");
        }
    })
    return true;
}

module.exports = removeAll;