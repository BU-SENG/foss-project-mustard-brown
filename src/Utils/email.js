// /Utils/sendMail.js
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import createHttpError from "http-errors";

let transporter = null; // cache transporter instance

export async function sendMail({
  to,
  subject,
  intro = [],
  fullname,
  btnText,
  instructions = "",
  link,
}) {
  // Validate basic input
  if (!to || !subject || !intro) {
    throw createHttpError(
      400,
      "Email recipient, subject, or intro is missing."
    );
  }

  // Validate env
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw createHttpError(500, "Email service not properly configured.");
  }

  try {
    // Create transporter only once
    if (!transporter) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Verify once on startup
      await transporter.verify().catch((error) => {
        throw createHttpError(
          500,
          `Failed to connect to email service: ${error.message}`
        );
      });
    }

    // Mailgen Setup
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "OpenTask",
        link: process.env.NEXT_PUBLIC_BASE_URL || "https://foss-project-mustard-brown.vercel.app/",
      },
    });

    // Email structure
    const email = {
      body: {
        name: fullname,
        intro,
        action: {
          instructions:
            instructions || "Please click the button below to proceed.",
          button: {
            color: "#32a852",
            text: btnText || "Visit",
            link,
          },
        },
        outro: "If you have any questions, simply reply to this email.",
      },
    };

    const emailBody = mailGenerator.generate(email);

    // Send mail
    const info = await transporter.sendMail({
      from: `"OpenTask" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailBody,
    });

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email service error:", error);
    throw createHttpError(500, "Failed to send email. Try again.");
  }
}
