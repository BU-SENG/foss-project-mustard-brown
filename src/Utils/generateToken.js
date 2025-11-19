import jwt from "jsonwebtoken";

export const generateAccessToken = (
  payload,
  options = { expiresIn: "1h" },
  secretKey = process.env.JWT_SECRET
) => {
  return jwt.sign(payload, secretKey, options);
};
-