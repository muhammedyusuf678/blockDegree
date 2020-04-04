var mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
    employerID:{
        type: Number,
        autogenerated: true
    },
    employerName:{
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
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
    verified: {
        type: Boolean,
        default: false
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
var Employer = new mongoose.model("Employer", employerSchema);

module.exports = Employer;