import nodemailer from 'nodemailer'
import dotenv from "dotenv"

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

export default transporter;