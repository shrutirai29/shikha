import Product from "../../models/product/product.model";
import { ProductSearchQuery } from "../../interfaces/search/search.interface";
import { escapeRegex } from "../../utils/regex.util";

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

export const searchProducts = async ({
  q = "",
  page = 1,
  limit = 10,
  category,
  minPrice,
  maxPrice,
  sort = "-createdAt",
}: ProductSearchQuery) => {
  const filter: Record<string, any> = {
    isActive: true,
  };

  if (q) {
    const escapedQuery = escapeRegex(q);
    filter.$or = [
      {
        name: {
          $regex: escapedQuery,
          $options: "i",
        },
      },
      {
        description: {
          $regex: escapedQuery,
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

  const safeSort = allowedSortFields.has(sort)
    ? sort
    : "-createdAt";

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category", "name slug")
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
