var arr = [1,2,3,4,5]
var arr2 = arr.filter(function(val){
    if(val>3) return val
})
console.log(arr2)