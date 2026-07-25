import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { productSearchQuerySchema } from "../../validators/search/search.validator";
import * as searchService from "../../services/search/search.service";

export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const query = productSearchQuerySchema.parse(req.query);

    const result = await searchService.searchProducts(query);

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);
