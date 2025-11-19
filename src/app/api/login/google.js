import passport from "passport";

// This handler starts the Google OAuth2 flow
export default function handler(req, res) {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
}
