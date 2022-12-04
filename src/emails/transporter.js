const nodemailer = require('nodemailer');
const config = require('../../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_ADRESS,
      pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = transporter;