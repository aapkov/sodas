const config = require('../config/config');
const transporter = require('./emails/transporter');

function sendUnbanEmail(email, resolution = "ACCEPTED") {

    const mailOptions = {
        from: config.EMAIL_ADRESS,
        to: email,
        subject: `[${resolution}] Sodapoppin unban appeal`,
        text: `Your unban appeal has been ${resolution}.`
    };

    transporter.sendMail(mailOptions, function(error){
        if (error) { console.log(error); }
      });
}

module.exports = sendUnbanEmail;