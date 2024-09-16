import mailgun from "mailgun-js";
import dotenv from "dotenv";

dotenv.config();

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const data = {
      from: `Your App <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      text,
      html,
    };

    const body = await mg.messages().send(data);

    console.log("Email:", body);
  } catch (error) {
    console.log("Error:", error.message);
  }
};
