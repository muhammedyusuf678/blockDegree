var myfunction = async () => {
    var foundStudent = await dbFunctions.findStudentByBlockDegreeEmail(email);//1st statement
    var newDegree = { //2nd statement
        ...req.body,
        university: JSON.parse(req.body.university),
        student: foundStudent
    }
    console.log(newDegree)
}
myfunction();