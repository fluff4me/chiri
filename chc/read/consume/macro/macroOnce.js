const ChiriReader = require("../../ChiriReader");

/**
 * @param {ChiriReader} reader 
 */
module.exports = reader => reader.consumeOptional("#once") && reader.setOnce();
