import jwt from "jsonwebtoken";

export const generateAccessToken = (
  payload,
  options = { expiresIn: "1h" },
  secretKey = process.env.JWT_SECRET_KEY
) => {
  return jwt.sign(payload, secretKey, options);
};
