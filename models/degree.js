var mongoose = require("mongoose");

//SCHEMA/blueprint setup
var degreeSchema = new mongoose.Schema({
    degreeID: {
        type: Number,
        autogenerated: true
    },
    university:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    universityName: {
        type: String,
        required: true
    },
    studentUniversityEmail: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    major: {
        type: String,
        required: true
    },
    cgpa: {
        type: Number,
        required: true
    },
    honors: {
        type: String
    },
    degreeType: {
        type: String,
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    }
}, { versionKey: false });
//compile into model which has methods
var Degree = new mongoose.model("Degree", degreeSchema);

module.exports = Degree;

// universityName: {
    //     type: String,
    //     required: true
    // },
    // studentBlockDegreeEmail: {
    //     type: String,
    //     required: true
    // },
    // studentName: {
    //     type: String,
    //     required: true
    // },
    // studentUniversityEmail: {
    //     type: String,
    //     required: true
    // },