const {isValidJoinRequest} = import("../requestValidation.js");
console.log(isValidJoinRequest);


module.exports.messageName = "Join";
module.exports.onMessage = (ws, data) =>{
    console.log("Cool! %s", isValidJoinRequest(data));
}