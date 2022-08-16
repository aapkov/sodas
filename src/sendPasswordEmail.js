const config = require('../config/config');
const transporter = require('./emails/transporter');

module.exports = function sendPasswordEmail(username, password, email) {

    const mailOptions = {
        from: config.EMAIL_ADRESS,
        to: email,
        subject: 'Login info for skippybot site',
        text: `Username: ${username}\nPassword: ${password}`
    };

    transporter.sendMail(mailOptions, function(error){
        if (error) { console.log(error); }
      });
}