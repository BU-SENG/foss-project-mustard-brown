import DBconnect from "@/Utils/DBconnect";
import User from "@/Models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await DBconnect();
    const body = await req.json();
    const { fullName, email, password } = body;

    const UserExists = await User.findOne({ email });
    if (UserExists) {
      return NextResponse.json(
        { message: "This User already exists" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      verificationToken: token,
    });

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
      subject: "Verify your email",
      html: `
        <h2>Hello ${fullName},</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyURL}" style="color:blue;">Verify Email</a>
      `,
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 200 });
  } catch (error) {
    console.error("Error in register API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ GET all users (for team dropdown)
export async function GET(req) {
  try {
    await DBconnect();

    // Get auth token from cookies
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Decode token to identify current user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;

    // Fetch all users except the current one
    const users = await User.find({ _id: { $ne: currentUserId } }, "_id fullName email");

    // Return as a raw array (same as before)
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message },
      { status: 500 }
    );
  }
}
