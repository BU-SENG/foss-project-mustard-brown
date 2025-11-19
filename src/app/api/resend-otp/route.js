import { NextResponse } from "next/server";
import DBconnect from "@/Utils/DBconnect";
import UserModel from "@/Models/User";
import { sendMail } from "@/Utils/sendMail";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await DBconnect();
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otpCode;
    user.otpExpires = otpExpiry;
    await user.save();
    
    // Send OTP via email using reusable utility
    await sendMail({
      to: user.email,
      subject: "Your OTP Code",
      fullname: user.fullName || user.email,
      intro: [
        `Hello ${user.fullName || user.email},`,
        `Your OTP code for login is:`,
      ],
      btnText: otpCode,
      instructions: "This code will expire in 5 minutes. If you didn’t request this, please ignore this email."
    });

    return NextResponse.json(
      { message: "OTP resent successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend OTP error:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
