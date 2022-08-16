const nodemailer = require('nodemailer');
const config = require('../../config/config');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      type: 'OAuth2',
      user: config.EMAIL_ADRESS,
      clientId: config.client_id,
      clientSecret: config.client_secret,
      refreshToken: config.client_refresh_token
  }
});

module.exports = transporter;