import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../services/product/product.service";

import { createProductSchema } from "../../validators/product/product.validator";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createProductSchema.parse(req.body);

  const product = await createProduct(validatedData);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const search = (req.query.search as string) || "";
  const sort = (req.query.sort as string) || "-createdAt";

  const result = await getAllProducts({
    page,
    limit,
    search,
    sort,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const product = await getProductById(id);

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const product = await updateProduct(id, req.body);

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  await deleteProduct(id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});