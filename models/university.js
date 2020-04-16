var mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
    universityName: {
        type: String,
        required: true,
        unique: true,
    },
    registeredStudentsList:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        }
    ],
    blockDegreeEmail: {
        type:String,
        required: true,
        unique: true
    },
    // registeredStudentsList:[
    //     {
    //         studentReference: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: 'Student',
    //             required: true
    //         },
    //         studentUniversityEmail:{
    //             type: String,
    //             required: true
    //         }
    //     }
    // ],
    issuedDegrees:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Degree',
            required: true
        }
    ],
    location: {
        country: {
            type: String,
            required: true
        },
        city:{
            type: String,
            required: true
        },
        poBox:{
            type: Number,
            required: true
        }
    },
    contactNumber:{
        type:Number,
        required:true
    },
    domainName:{
        type:String,
        required:true
    },
    colleges: [
        {
            name:{
                type: String,
                required: true
            }
        }
    ],
    verified: {
        type: Boolean,
        default: false
    },
    dean: {
        type:String,
        required: true
    },
    chancellor: {
        type: String,
        required: true
    },
    sharesList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Degree',
            required: true
        }
    ]

});

//compile into model which has methods
var University = new mongoose.model("University", universitySchema);

module.exports = University;