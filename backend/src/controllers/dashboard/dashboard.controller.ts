import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as dashboardService from "../../services/dashboard/dashboard.service";

export const getAdminDashboard = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const dashboard =
      await dashboardService.getAdminDashboard();

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  }
);
