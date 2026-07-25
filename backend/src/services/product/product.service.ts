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
}

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
}: GetProductsQuery) => {
  const filter = {
    isActive: true,
    name: {
      $regex: search,
      $options: "i",
    },
  };

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category")
    .sort(sort)
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