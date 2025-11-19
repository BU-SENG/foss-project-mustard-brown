// Improved: Added header comments and variable renaming for clarity

// Handles user login and sends OTP for verification
export async function POST(req) {
  try {
    // Parse request body
    const body = await req.json();
    const { email, password } = body;

    // Connect to database
    await DBconnect();

    // Look up user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Ensure account is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Account Email Unverified" },
        { status: 403 }
      );
    }

    // Validate password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins

    // Attach OTP to user
    user.otp = otpCode;
    user.otpExpires = otpExpiry;
    await user.save();

    // Prepare nodemailer for sending OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content configuration
    const mailOptions = {
      from: `"OpenTask" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your 2FA Verification Code",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>🔐 Two-Factor Authentication</h2>
          <p>Hello ${user.email},</p>
          <p>Your OTP code is:</p>
          <h1 style="background:#f5f5f5;display:inline-block;padding:10px 20px;border-radius:8px;">${otpCode}</h1>
          <p>This code will expire in <b>5 minutes</b>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send the OTP email
    await transporter.sendMail(mailOptions);

    // Respond with success
    return NextResponse.json(
      { message: "OTP sent to your email", email: user.email },
      { status: 200 }
    );
  } catch (err) {
    // Log and return error
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
