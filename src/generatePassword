const cryptoRandomString = require("crypto-random-string");

module.exports = function generatePassword(length = 10) {
    return cryptoRandomString({length: length, type: 'base64'});
}