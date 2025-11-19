// POST /api/reset-password
import DBconnect from "@/Utils/DBconnect";
import UserModel from "@/Models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await DBconnect();
    const { token, password } = await req.json();

    if (!token || !password || password.length < 6) {
      return NextResponse.json(
        { message: "Invalid request. Token and strong password required." },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return NextResponse.json(
        { message: "Reset link has expired or is invalid." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successful! You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}