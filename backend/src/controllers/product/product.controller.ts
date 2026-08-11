import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  addProductImages,
  removeProductImage,
} from "../../services/product/product.service";

import {
  uploadImages as uploadToCloudinary,
  deleteImage,
  getPublicIdFromUrl,
} from "../../services/upload/upload.service";

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

export const getAllAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const query = productQuerySchema.parse(req.query);

    const result = await getAllProducts({
      ...query,
      includeInactive: true,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

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

  const { permanent } = await deleteProduct(id);

  res.status(200).json({
    success: true,
    message: permanent
      ? "Product permanently deleted"
      : "Product deactivated. Delete again to permanently remove it.",
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

export const uploadProductImages = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No images provided",
      });
      return;
    }

    const uploaded = await uploadToCloudinary(
      files.map((file) => ({ buffer: file.buffer, mimetype: file.mimetype }))
    );

    const product = await addProductImages(
      id,
      uploaded.map((image) => image.url)
    );

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: product,
    });
  }
);

export const deleteProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { url } = req.body as { url?: string };

    if (!url) {
      res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
      return;
    }

    const publicId = getPublicIdFromUrl(url);

    if (publicId) {
      await deleteImage(publicId).catch(() => {
        // Cloudinary deletion failure should not block removing the reference
      });
    }

    const product = await removeProductImage(id, url);

    res.status(200).json({
      success: true,
      message: "Image removed successfully",
      data: product,
    });
  }
);
