var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/block_degree", { useNewUrlParser: true, useUnifiedTopology: true });

var User = require("./models/user");

var University = require("./models/university");
var Student = require("./models/student");
var Degree = require("./models/degree");
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
    issueDate: new Date()
}

var seedDegree2 =
{
    university: mongoose.Types.ObjectId(),
    student: mongoose.Types.ObjectId(),
    studentName: "Saeed Al Ghabra",
    universityName: "Skyline University College",
    studentUniversityEmail: "b00072056@aus.edu",
    college: "College of Engineering",
    major: "Computer Science",
    cgpa: 3.5,
    honors: "Magna Cum Laude",
    degreeType: "Bachelor of Science",
    issueDate: new Date()
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
    University.create(seedUniversity, function (err, savedUniversity) {
        if (err) console.log(err);
        else {
            console.log("added university");
            registerUser("registrar@aus.edu","mufasa",'University',savedUniversity._id);
            Student.create(seedStudent, function (err, savedStudent) {
                if (err) console.log(err);
                else {
                    console.log("added student");
                    registerUser("muhammedyusuf678@gmail.com","mufasa",'Student',savedStudent._id);
                    savedUniversity.registeredStudentsList.push({
                        studentReference: savedStudent,
                        studentUniversityEmail: "b00068047@aus.edu"
                    });

                    savedStudent.universitiesList.push({
                        universityReference: savedUniversity,
                        studentUniversityEmail: "b00068047@aus.edu"
                    });

                    Degree.create(seedDegree, async function (err, savedDegree) {
                        if (err) console.log(err);
                        else {
                            console.log("added Degree");

                            savedDegree.university = savedUniversity;
                            savedDegree.student = savedStudent;
                            await savedDegree.save(function (err) {
                                if (err) console.log(err);
                                else console.log("updated degree")
                            });

                            savedStudent.degreesList.push(savedDegree);

                            savedUniversity.issuedDegrees.push(savedDegree);
                            // await savedUniversity.save(function (err) {
                            //     if (err) console.log(err);
                            //     else console.log("updated university")

                            // });
                            // console.log("Saved data is: ");
                            // console.log(savedUniversity);
                            // console.log(savedStudent);
                            // console.log(savedDegree);

                            await Employer.create(seedEmployer, async function (err, savedEmployer) {
                                if (err) console.log(err)
                                else {
                                    console.log("added employer");
                                    registerUser("elon@tesla.com","mufasa",'Employer',savedEmployer._id);
                                    savedEmployer.sharesList.push(savedDegree);
                                    savedUniversity.sharesList.push(savedDegree);
                                    savedStudent.sharesList.push({
                                        degree: savedDegree,
                                        userType: 'Employer',
                                        sharedWith: savedEmployer
                                    });
                                    savedStudent.sharesList.push({
                                        degree: savedDegree,
                                        userType: 'University',
                                        sharedWith: savedUniversity
                                    });

                                    await savedEmployer.save(function (err) {
                                        if (err) console.log(err);
                                        else {
                                            console.log("updated employer");
                                        }
                                    })
                                    await savedStudent.save(function (err) {
                                        if (err) console.log(err)
                                        else console.log("updated student")
        
                                    });

                                    await savedUniversity.save(function (err) {
                                        if (err) console.log(err);
                                        else {
                                            console.log("updated university and shared degree with it");
                                        }
                                    })

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
                    })
                }
            })
        }
    })
    await University.create(seedUniversity2, async function (err, savedUniversity) {
        if (err) console.log(err)
        else {
            console.log("added 2nd university")
            registerUser("registrar@sky.edu","mufasa",'University',savedUniversity._id);
        }
    })

    await Student.create(seedStudent2, async function (err, savedStudent) {
        if (err) console.log(err)
        else {
            console.log("added 2nd student")
            registerUser("saeed@gmail.com","mufasa",'Student',savedStudent._id);
        }
    })

    await Degree.create(seedDegree2, async function (err, savedDegree) {
        if (err) console.log(err)
        else {
            console.log("added 2nd degree")
        }
    })
    
}

async function main() {
    var result = await removeAll();
    var result2 = await seedDB();
    console.log("done")
}

main();

module.exports = {
    seedDegree: seedDegree
}


