import DBconnect from "@/Utils/DBconnect";
import User from "@/Models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendMail } from "@/Utils/sendMail";

export async function POST(req) {
  try {
    await DBconnect();
    const { fullName, email, password } = await req.json();

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: "This user already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token (inline JWT)
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      verificationToken: token,
    });

    // Verification link
    const verifyURL = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;

    // Send verification email using reusable utility
    await sendMail({
      to: email,
      subject: "Verify your email",
      fullname: fullName,
      intro: [
        `Hello ${fullName},`,
        "Welcome to OpenTask! Please verify your email by clicking the button below.",
      ],
      btnText: "Verify Email",
      instructions:
        "Click the button to verify your account. Link expires in 24 hours.",
      link: verifyURL,
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 200 });
  } catch (error) {
    console.error("Error in register API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET all users (for team dropdown)
export async function GET(req) {
  try {
    await DBconnect();

    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;

    const users = await User.find(
      { _id: { $ne: currentUserId } },
      "_id fullName email"
    );

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message },
      { status: 500 }
    );
  }
}
