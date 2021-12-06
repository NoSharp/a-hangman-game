const path = require("path");
const {readdirSync} =  require("fs");

const basePath = path.join(`${__dirname}`, "messagetypes");
const contents = readdirSync(basePath);

const types = {};

for(const file of contents){
    const requirePath = path.join(basePath, file);
    const {messageName, onMessage} = require(requirePath);
    types[messageName] = onMessage;
    console.log(`Registered Message: ${messageName}`);
}



/**
 * Gets the actioner method for a type.
 * @param {string} type 
 */
module.exports.getActioner = (type) => {
    return types[type];
}