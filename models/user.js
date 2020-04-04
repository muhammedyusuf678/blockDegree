var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,//blockDegreeEmail
    password: String,
    userType: { 
        type: String, 
        required: true,
        enum: ['Student', 'Employer','University']//can be anyone
    },
    userObject: {
        type: mongoose.Schema.Types.ObjectId,
	    refPath: 'userType',
    }
});

//contain all schema types that we want to use in our abilities field. abilityType will only validate if its value is one of the strings defined in the enum array.

//refPath: 'abilityType' means that mongoose will check the abilityType field to get the schema name to which to reference
//ref is only to reference one document type


UserSchema.plugin(passportLocalMongoose)
//compile into model which has methods
var User = new mongoose.model("User", UserSchema);

module.exports = User;
