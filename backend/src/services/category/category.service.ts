import Category from "../../models/category/category.model";
import { ICategory } from "../../interfaces/category/category.interface";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

interface GetCategoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export const createCategory = async (
  data: Partial<ICategory>
): Promise<ICategory> => {
  const existingCategory = await Category.findOne({
    name: data.name,
  });

  if (existingCategory) {
    throw new ConflictError("Category already exists");
  }

  const slug = generateSlug(data.name!);

  const category = await Category.create({
    ...data,
    slug,
  });

  return category;
};

export const getAllCategories = async ({
  page = 1,
  limit = 10,
  search = "",
  sort = "-createdAt",
}: GetCategoriesQuery) => {
  const filter = {
    isActive: true,
    name: {
      $regex: search,
      $options: "i",
    },
  };

  const total = await Category.countDocuments(filter);

  const categories = await Category.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    categories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCategoryById = async (
  id: string
): Promise<ICategory> => {
  const category = await Category.findById(id);

  if (!category || !category.isActive) {
    throw new NotFoundError("Category not found");
  }

  return category;
};

export const updateCategory = async (
  id: string,
  data: Partial<ICategory>
): Promise<ICategory> => {
  const existingCategory = await Category.findOne({
    _id: id,
    isActive: true,
  });

  if (!existingCategory) {
    throw new NotFoundError("Category not found");
  }

  if (data.name) {
    data.slug = generateSlug(data.name);
  }

  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return category!;
};

export const deleteCategory = async (
  id: string
): Promise<ICategory> => {
  const existingCategory = await Category.findOne({
    _id: id,
    isActive: true,
  });

  if (!existingCategory) {
    throw new NotFoundError("Category not found");
  }

  const category = await Category.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
    }
  );

  return category!;
};

export const getCategoryBySlug = async (
  slug: string
): Promise<ICategory> => {
  const category = await Category.findOne({
    slug,
    isActive: true,
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};