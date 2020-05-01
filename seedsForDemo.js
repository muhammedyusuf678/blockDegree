var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/block_degree", { useNewUrlParser: true, useUnifiedTopology: true });

var User = require("./models/user");

var University = require("./models/university");
var Student = require("./models/student");
var Employer = require("./models/employer")

const removeAll = require("./cleardb");
 
var seedUniversity =
{
    universityName: "American University of Sharjah",
    registeredStudentsList: [],
    issuedDegrees: [],
    location: {
        country: "United Arab Emirates",
        city: "Sharjah",
        poBox: 26666

    },
    contactNumber: 065330632,
    domainName: "aus.edu",
    colleges: [
        {
            name: "College of Engineering"
        },
        {
            name: "School of Business Administration"
        }
    ],
    verified: true,
    dean: "Sirin Tekinay",
    chancellor: "Kevin Mitchell",
    sharesList: [],
    blockDegreeEmail: "registrar@aus.edu"
}

var seedUniversity2 =
{
    universityName: "Skyline University College",
    registeredStudentsList: [],
    issuedDegrees: [],
    location: {
        country: "United Arab Emirates",
        city: "Sharjah",
        poBox: 26666

    },
    contactNumber: 065330632,
    domainName: "sky.edu",
    colleges: [
        {
            name: "College of Engineering"
        },
        {
            name: "School of Business Administration"
        }
    ],
    verified: true,
    dean: "Raj Mithra",
    chancellor: "Jacob Peters",
    sharesList: [],
    blockDegreeEmail: "registrar@sky.edu"

}


var seedStudent =
{
    name: "Muhammed Yusuf",
    universitiesList: [],
    degreesList: [],
    sharesList: [],
    contactNumber: "0501196231",
    verified: true,
    blockDegreeEmail: "muhammedyusuf678@gmail.com"
}

var seedStudent2 =
{
    name: "Saeed Alghabra",
    universitiesList: [],
    degreesList: [],
    sharesList: [],
    contactNumber: "0501196231",
    verified: true,
    blockDegreeEmail: "saeed@gmail.com"
}


var seedEmployer =
{
    employerName: "Elon Musk",
    companyName: "Tesla",
    location: {
        country: "USA",
        city: "Houston",
        poBox: 2666
    },
    contactNumber: 1209832,
    sharesList: [],
    blockDegreeEmail: "elon@tesla.com"

}
var seedEmployer2 =
{
    employerName: "Steve Jobs",
    companyName: "Apple",
    location: {
        country: "USA",
        city: "Houston",
        poBox: 2666
    },
    contactNumber: 1209832,
    sharesList: [],
    blockDegreeEmail: "steve@apple.com"

}

function registerUser(username, password, userType, userObject){
    var newUser = new User({
        username: username,
        userType: userType,
        userObject: userObject
    });
    User.register(newUser, password, function (err, savedUser) {
        if (err) {
            console.log(err);
        }
        else{
            console.log("saved User of type:"+savedUser.userType);
            // console.log(savedUser);
        }
    })
}



async function seedDB() {
    await University.create(seedUniversity, async function (err, savedUniversity) {
        if (err) console.log(err)
        else {
            console.log("added university")

            registerUser("registrar@aus.edu","mufasa",'University',savedUniversity._id);
        }
    })
    await University.create(seedUniversity2, async function (err, savedUniversity) {
        if (err) console.log(err)
        else {
            console.log("added 2nd university")

            registerUser("registrar@sky.edu","mufasa",'University',savedUniversity._id);
        }
    })

    await Student.create(seedStudent, async function (err, savedStudent) {
        if (err) console.log(err)
        else {
            console.log("added student")
            registerUser("muhammedyusuf678@gmail.com","mufasa",'Student',savedStudent._id);
        }
    })

    await Student.create(seedStudent2, async function (err, savedStudent) {
        if (err) console.log(err)
        else {
            console.log("added 2nd student")
            registerUser("saeed@gmail.com","mufasa",'Student',savedStudent._id);
        }
    })

    await Employer.create(seedEmployer, async function (err, savedEmployer) {
        if (err) console.log(err)
        else {
            console.log("added employer")
            registerUser("elon@tesla.com","mufasa",'Employer',savedEmployer._id);

        }
    })

    await Employer.create(seedEmployer2, async function (err, savedEmployer) {
        if (err) console.log(err)
        else {
            console.log("added 2nd employer")
            registerUser("steve@apple.com","mufasa",'Employer',savedEmployer._id);

        }
    })


}

async function main() {
    var result = await removeAll();
    var result2 = await seedDB();
    console.log("done")
}

main();




