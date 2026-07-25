import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as analyticsService from "../../services/analytics/analytics.service";
import { analyticsQuerySchema } from "../../validators/analytics/analytics.validator";

export const getSalesAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);

    const analytics =
      await analyticsService.getSalesAnalytics(query);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  }
);

export const getProductAnalytics = asyncHandler(
  async (_req: Request, res: Response) => {
    const analytics =
      await analyticsService.getProductAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  }
);
