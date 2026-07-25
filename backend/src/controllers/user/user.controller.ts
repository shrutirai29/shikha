import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "../../services/user/user.service";
import {
  updateProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userListQuerySchema,
} from "../../validators/user/user.validator";

export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await userService.getProfile(req.user!._id.toString());

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const updateMe = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = updateProfileSchema.parse(req.body);

    const user = await userService.updateProfile(
      req.user!._id.toString(),
      data
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  }
);

export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = userListQuerySchema.parse(req.query);

    const result = await userService.getAllUsers(query);

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const getUserById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await userService.getUserById(req.params.id as string);

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const updateUserStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { isActive } = updateUserStatusSchema.parse(req.body);

    const user = await userService.updateUserStatus(
      req.user!._id.toString(),
      req.params.id as string,
      isActive
    );

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  }
);

export const updateUserRole = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { role } = updateUserRoleSchema.parse(req.body);

    const user = await userService.updateUserRole(
      req.user!._id.toString(),
      req.params.id as string,
      role
    );

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  }
);
