$("#queryBlockchain").click(function (e) { 
    e.preventDefault();
    var blockchainKey = $("#queryBlockchainKey").val();
    alert("querying blockchain with key: "+blockchainKey)
    $.ajax({
        type: "POST",
        url: "/queryBlockchain",
        data: {
            key: blockchainKey
        },
        success: function (response) {
            $("#queryResult").html("<br>"+response);
        }
    });
});

$("#invokeChaincode").click(function (e) { 
    e.preventDefault();
    $.ajax({
        type: "get",
        url: "/invokeChaincode",
        success: function (response) {
            if(response){
                alert('Transaction has been submitted');
            }
        }
    });
});

// $("#submitAddDegree").click(function(e){
//     e.preventDefault();
//     alert()
//     $.ajax({
//         type: "POST",
//         url: "/queryBlockchain",
//         data: {
//             key: blockchainKey
//         },
//         success: function (response) {
//             $("#queryResult").html("<br>"+response);
//         }
//     });

// })