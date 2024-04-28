const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

const pass = process.env.MAIL_PASS

// Konfigurera e-posttransport
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'philipjansson1027@hotmail.com',
    pass: pass
  }
});

module.exports = transporter;