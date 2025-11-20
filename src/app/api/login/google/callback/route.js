import { google } from "googleapis";
import DBconnect from "@/Utils/DBconnect";
import UserModel from "@/Models/User";
import { generateAccessToken } from "@/Utils/generateToken";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/login/google/callback`
);

export async function GET(req) {
  await DBconnect();
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/Login?error=access_denied`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Find or create user WITHOUT requiring password
    let user = await UserModel.findOne({ 
      $or: [{ email: data.email }, { googleId: data.id }] 
    });

    if (!user) {
      user = new UserModel({
        fullName: data.name || data.email.split("@")[0],
        email: data.email,
        googleId: data.id,
        avatar: data.picture,
        isVerified: true,
        // NO PASSWORD → Google users no need am
      });
      await user.save();
    } else if (!user.googleId) {
      // Existing normal user now signing in with Google → link accounts
      user.googleId = data.id;
      user.avatar = data.picture || user.avatar;
      await user.save();
    }

    const token = generateAccessToken({ id: user._id });

    // Proper full URL redirect + secure cookie
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/Dashboard`;

    return new Response(
      `<script>
        document.cookie = "authToken=${token}; path=/; max-age=31536000; Secure; SameSite=Lax";
        window.location.href = "${redirectUrl}";
      </script>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );

  } catch (error) {
    console.error("Google OAuth Error:", error.message || error);
    
    // FIX: Use full URL here too!
    return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/Login?error=google_failed`);
  }
}