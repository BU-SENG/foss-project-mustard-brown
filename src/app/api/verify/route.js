import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/Models/User";
import connectDB from "@/Utils/DBconnect";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    if (user.isVerified) return NextResponse.json({ message: "Already verified" }, { status: 200 });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return NextResponse.json({ message: "Email verified successfully!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
  }
}