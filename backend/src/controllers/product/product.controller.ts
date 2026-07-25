import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from "../../services/product/product.service";

import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from "../../validators/product/product.validator";

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
  const query = productQuerySchema.parse(req.query);

  const result = await getAllProducts(query);

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

  const validatedData = updateProductSchema.parse(req.body);

  const product = await updateProduct(id, validatedData);

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

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const product = await getProductBySlug(slug);

  res.status(200).json({
    success: true,
    data: product,
  });
});
