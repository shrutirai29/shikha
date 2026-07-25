import User from "../../models/auth/auth.model";
import { IUser } from "../../interfaces/auth/auth.interface";
import { hashPassword } from "../../utils/password";
import { ConflictError } from "../../errors/ConflictError";

export const registerAdmin = async (
  adminData: Pick<IUser, "name" | "email" | "password">
): Promise<IUser> => {
  const existingAdmin = await User.findOne({
    email: adminData.email,
  });

  if (existingAdmin) {
    throw new ConflictError("Admin already exists with this email");
  }

  const hashedPassword = await hashPassword(adminData.password!);

  const admin = await User.create({
    name: adminData.name,
    email: adminData.email.toLowerCase(),
    password: hashedPassword,
    role: "admin",
    isVerified: true,
    isActive: true,
  });

  return admin;
};
