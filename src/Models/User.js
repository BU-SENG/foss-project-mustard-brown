import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  //   phone: { type: String, required: true },
  password: { type: String, required: false },
  profileImage: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  lastLogin: { type: Date, default: null },
});
const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
