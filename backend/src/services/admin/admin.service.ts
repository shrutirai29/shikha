import Admin from "../../models/admin/admin.model";
import { IAdmin } from "../../interfaces/admin/admin.interface";
import { hashPassword } from "../../utils/password";
import { ConflictError } from "../../errors/ConflictError";

export const registerAdmin = async (
  adminData: Partial<IAdmin>
): Promise<IAdmin> => {
  const existingAdmin = await Admin.findOne({
    email: adminData.email,
  });

  if (existingAdmin) {
    throw new ConflictError("Admin already exists with this email");
  }

  const hashedPassword = await hashPassword(adminData.password!);

  const admin = await Admin.create({
    ...adminData,
    password: hashedPassword,
  });

  return admin;
};