import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_USER,
    pass: process.env.OUTLOOK_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.OUTLOOK_USER,
      to,
      subject,
      text,
      html,
    });
    console.log("Send email:", info.response);
  } catch (error) {
    console.log(error, error.message);
  }
};
