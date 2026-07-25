import { Request, Response } from "express";
import { registerAdmin } from "../../services/admin/admin.service";
import { registerAdminSchema } from "../../validators/admin/admin.validator";
import { asyncHandler } from "../../utils/asyncHandler";

export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const validatedData = registerAdminSchema.parse(req.body);

    const admin = await registerAdmin(validatedData);

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: adminResponse,
    });
  }
);