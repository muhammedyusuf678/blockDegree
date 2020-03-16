async function CreateDegree(contract, degree){
    try{
        var result = await contract.submitTransaction('createDegree', degree);
        return result;
    }
    catch (error){
        console.log("SubmitTransaction createDegree failed: "+error);
        return false;
    }
    
}

async function QueryDegree(contract, key){
    try{
        const result = await contract.evaluateTransaction('queryDegree', key);
        return result;
    }
    catch (error){
        console.log("EvaluateTransaction queryDegree failed: "+error);
        return false;
    }
}

async function QueryAllDegrees(contract){
    try{
        const result = await contract.evaluateTransaction('queryAllDegrees');
        return result;
    }
    catch (error){
        console.log("EvaluateTransaction queryAllDegrees failed: "+error);
        return false;
    }
}


module.exports = {
    CreateDegree: CreateDegree,
    QueryDegree: QueryDegree,
    QueryAllDegrees: QueryAllDegrees
}

