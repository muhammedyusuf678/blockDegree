var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/block_degree", { useNewUrlParser: true, useUnifiedTopology: true });

var University = require("./models/university");
var Student = require("./models/student");
var Degree = require("./models/degree");
var Employer = require("./models/employer")

var seedUniversity =
{
    universityName: "American University of Sharjah",
    userCredentials: [
        {
            userEmail: "registrar@aus.edu",
            userPassword: "mufasa123",
            accessLevel: 0
        }
    ],
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
    verified: true
}


var seedStudent =
{
    name: "Muhammed Yusuf",
    blockDegreeEmail: "muhammedyusuf678@gmail.com",
    password: "mufasa123",
    universitiesList: [],
    degreesList: [],
    sharesList: [],
    contactNumber: "0501196231",
    verified: true
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

var seedEmployer =
{
    employerName: "Elon Musk",
    companyName: "Tesla",
    blockDegreeEmail: "elon@tesla.com",
    password: "mufasa123",
    location: {
        country: "USA",
        city: "Houston",
        poBox: 2666
    },
    contactNumber: 1209832,
    sharesList: []
}
var seedEmployer2 =
{
    employerName: "Steve Jobs",
    companyName: "Apple",
    blockDegreeEmail: "steve@apple.com",
    password: "mufasa123",
    location: {
        country: "USA",
        city: "Houston",
        poBox: 2666
    },
    contactNumber: 1209832,
    sharesList: []
}

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
    return true;
}


async function seedDB() {
    University.create(seedUniversity, function (err, savedUniversity) {
        if (err) console.log(err);
        else {
            console.log("added university");
            Student.create(seedStudent, function (err, savedStudent) {
                if (err) console.log(err);
                else {
                    console.log("added student");

                    savedUniversity.registeredStudentsList.push(savedStudent);

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
                            await savedUniversity.save(function (err) {
                                if (err) console.log(err);
                                else console.log("updated university")

                            });
                            // console.log("Saved data is: ");
                            // console.log(savedUniversity);
                            // console.log(savedStudent);
                            // console.log(savedDegree);

                            await Employer.create(seedEmployer, async function (err, savedEmployer) {
                                if (err) console.log(err)
                                else {
                                    console.log("added employer");
                                    savedEmployer.sharesList.push(savedDegree);
                                    savedStudent.sharesList.push({
                                        degree: savedDegree,
                                        employer: savedEmployer
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

                                }
                            })
                            await Employer.create(seedEmployer2, async function (err, savedEmployer) {
                                if (err) console.log(err)
                                else {
                                    console.log("added 2nd employer")
                                }
                            })
                            console.log("done seeding");
                            return true;
                        }
                    })
                }
            })
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