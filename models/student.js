var mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    studentID: {
        type: Number,
        autogenerated: true
    },
    name: {
        type: String,
        required: true,
    },
    universitiesList: [
        {
            universityReference: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'University',
                required: true
            },
            studentUniversityEmail: {
                type: String,
                required: true
            },
            verified: {
                type: Boolean,
                default: false
            }
        }
    ],
    degreesList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Degree',
            required: true
        }
    ],
    sharesList: [
        {
            degree: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Degree',
                required: true
            },
            employer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Degree',
                required: true
            }
        }
    ],
    contactNumber: {
        type: Number,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    blockDegreeEmail: {
        type:String,
        required: true,
        unique: true
    }
});

//compile into model which has methods
var Student = new mongoose.model("Student", studentSchema);

module.exports = Student;