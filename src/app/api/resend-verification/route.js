import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/Models/User";
import connectDB from "@/Utils/DBconnect";
import { sendMail } from "@/Utils/sendMail";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

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

    const verifyURL = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;

    // Send verification email directly using reusable utility
    await sendMail({
      to: email,
      subject: "Verify your email (Resent)",
      fullname: user.name,
      intro: [
        `Hello ${user.name || "User"},`,
        "We noticed you haven’t verified your email yet.",
        "Please click the button below to verify your account:",
      ],
      btnText: "Verify Email",
      instructions: `Click the button to verify your account. Link will expire in 24 hours.`,
      link: verifyURL,
    });

    return NextResponse.json(
      { message: "Verification email resent successfully!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
