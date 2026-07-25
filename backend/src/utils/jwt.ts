import jwt from "jsonwebtoken";

export const generateAccessToken = (
  userId: string,
  role: string
) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    }
  );
};