import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "@/Models/User";
import connectDB from "@/Utils/DBconnect";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "User is already verified" }, { status: 400 });
    }

    // Generate new verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    user.verificationToken = token;
    await user.save();

    // Send the email again
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verifyURL = `${process.env.NEXT_PUBLIC_BASE_URL}/Verify?token=${token}`;

    await transporter.sendMail({
      from: `"OpenTask" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email (Resent)",
      html: `
        <h2>Hello ${user.name || "User"},</h2>
        <p>We noticed you haven’t verified your email yet.</p>
        <p>Please click the link below to verify your account:</p>
        <a href="${verifyURL}" style="color:blue;">Verify Email</a>
      `,
    });

    return NextResponse.json({ message: "Verification email resent successfully!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
