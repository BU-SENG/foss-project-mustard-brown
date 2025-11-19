import passport from "passport";
import { generateAccessToken } from "@/Utils/generateToken"; // Your utility

export default function handler(req, res) {
  passport.authenticate("google", { failureRedirect: "/Login" }, (err, user) => {
    if (err || !user) {
      return res.redirect("/Login?error=googleauth");
    }
    const token = generateAccessToken({ id: user._id, email: user.email });
    res.cookie("authToken", token, { httpOnly: true, path: "/" });
    res.redirect("/Dashboard"); // or respond with JSON/token
  })(req, res);
}
