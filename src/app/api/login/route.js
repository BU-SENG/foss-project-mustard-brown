import UserModel from "@/Models/User";
import DBconnect from "@/Utils/DBconnect";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    await DBconnect();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Account Email Unverified" },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // ✅ Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"OpenTask" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your 2FA Verification Code",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>🔐 Two-Factor Authentication</h2>
          <p>Hello ${user.email},</p>
          <p>Your OTP code is:</p>
          <h1 style="background:#f5f5f5;display:inline-block;padding:10px 20px;border-radius:8px;">${otp}</h1>
          <p>This code will expire in <b>5 minutes</b>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "OTP sent to your email", email: user.email },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
