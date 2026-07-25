import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
} from "../../services/category/category.service";

import {
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/category/category.validator";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createCategorySchema.parse(req.body);

  const category = await createCategory(validatedData);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const query = categoryQuerySchema.parse(req.query);

  const result = await getAllCategories(query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const category = await getCategoryById(id);

  res.status(200).json({
    success: true,
    data: category,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const validatedData = updateCategorySchema.parse(req.body);

  const category = await updateCategory(id, validatedData);

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  await deleteCategory(id);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const category = await getCategoryBySlug(slug);

  res.status(200).json({
    success: true,
    data: category,
  });
});
