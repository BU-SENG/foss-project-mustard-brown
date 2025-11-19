// POST /api/forgot-password
import DBconnect from "@/Utils/DBconnect";
import UserModel from "@/Models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendMail } from "@/Utils/sendMail";

export async function POST(req) {
  try {
    await DBconnect();
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "If your email is registered, a reset link has been sent." },
        { status: 200 }
      );
    }

    const user = await UserModel.findOne({email: email});

    // ALWAYS return the same success message
    // We'll send email only if user exists, but attacker won't know
    if (user) {
      try {
        // Generate reset token
        const resetToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "10m" }
        );

        // Save to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const resetURL = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

        // Send email (fire and forget inside try-catch so it never leaks existence)
        await sendMail({
          to: user.email,
          type: "resetPassword",
          fullname: user.fullName || user.email.split("@")[0],
          link: resetURL,
        });
      } catch (mailError) {
        console.error("Failed to send reset email:", mailError);
        // Do NOT throw — we don't want to leak that user exists!
      }
    }

    // Always return the same thing — perfect security
    return NextResponse.json(
      { message: "If your email is registered, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password route error:", error);
    // Even on server error, don't leak anything
    return NextResponse.json(
      { message: "If your email is registered, a reset link has been sent." },
      { status: 200 }
    );
  }
}