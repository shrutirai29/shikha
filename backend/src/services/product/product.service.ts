import Product from "../../models/product/product.model";
import Category from "../../models/category/category.model";

import { IProduct } from "../../interfaces/product/product.interface";

import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

interface GetProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

const allowedSortFields = new Set([
  "createdAt",
  "-createdAt",
  "price",
  "-price",
  "name",
  "-name",
  "averageRating",
  "-averageRating",
]);

export const createProduct = async (
  data: Partial<IProduct>
): Promise<IProduct> => {
  const category = await Category.findOne({
    _id: data.category,
    isActive: true,
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const existingProduct = await Product.findOne({
    name: data.name,
    isActive: true,
  });

  if (existingProduct) {
    throw new ConflictError("Product already exists");
  }

  const slug = generateSlug(data.name!);

  const product = await Product.create({
    ...data,
    slug,
  });

  return product;
};

export const getAllProducts = async ({
  page = 1,
  limit = 10,
  search = "",
  sort = "-createdAt",
  category,
  minPrice,
  maxPrice,
  isFeatured,
}: GetProductsQuery) => {
  const filter: Record<string, any> = {
    isActive: true,
  };

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (
    typeof minPrice === "number" ||
    typeof maxPrice === "number"
  ) {
    filter.price = {};

    if (typeof minPrice === "number") {
      filter.price.$gte = minPrice;
    }

    if (typeof maxPrice === "number") {
      filter.price.$lte = maxPrice;
    }
  }

  if (typeof isFeatured === "boolean") {
    filter.isFeatured = isFeatured;
  }

  const safeSort = allowedSortFields.has(sort)
    ? sort
    : "-createdAt";

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category")
    .sort(safeSort)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (
  id: string
): Promise<IProduct> => {
  const product = await Product.findOne({
    _id: id,
    isActive: true,
  }).populate("category");

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

export const updateProduct = async (
  id: string,
  data: Partial<IProduct>
): Promise<IProduct> => {
  const existingProduct = await Product.findOne({
    _id: id,
    isActive: true,
  });

  if (!existingProduct) {
    throw new NotFoundError("Product not found");
  }

  if (data.category) {
    const category = await Category.findOne({
      _id: data.category,
      isActive: true,
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }
  }

  if (data.name) {
    data.slug = generateSlug(data.name);
  }

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("category");

  return product!;
};

export const deleteProduct = async (
  id: string
): Promise<IProduct> => {
  const existingProduct = await Product.findOne({
    _id: id,
    isActive: true,
  });

  if (!existingProduct) {
    throw new NotFoundError("Product not found");
  }

  const product = await Product.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
    }
  );

  return product!;
};

export const getProductBySlug = async (
  slug: string
): Promise<IProduct> => {
  const product = await Product.findOne({
    slug,
    isActive: true,
  }).populate("category");

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

export const addProductImages = async (
  id: string,
  imageUrls: string[]
): Promise<IProduct> => {
  const product = await Product.findOne({
    _id: id,
    isActive: true,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  product.images.push(...imageUrls);

  await product.save();

  return (await Product.findById(id).populate("category"))!;
};

export const removeProductImage = async (
  id: string,
  imageUrl: string
): Promise<IProduct> => {
  const product = await Product.findOne({
    _id: id,
    isActive: true,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const index = product.images.indexOf(imageUrl);

  if (index === -1) {
    throw new NotFoundError("Image not found on this product");
  }

  product.images.splice(index, 1);

  await product.save();

  return (await Product.findById(id).populate("category"))!;
};
