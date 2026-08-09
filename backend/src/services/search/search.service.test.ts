import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/product/product.model", () => ({
  default: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

import Product from "../../models/product/product.model";
import { searchProducts } from "./search.service";

const buildQuery = (overrides: Record<string, any> = {}) => ({
  q: "phone",
  page: 1,
  limit: 10,
  sort: "-createdAt",
  ...overrides,
});

describe("search.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockChain = (products: any[]) => {
    const chain = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(products),
    };

    (Product.find as any).mockReturnValue(chain);

    return chain;
  };

  it("returns products with pagination metadata", async () => {
    (Product.countDocuments as any).mockResolvedValue(25);
    mockChain([{ _id: "p1" }, { _id: "p2" }]);

    const result = await searchProducts(buildQuery());

    expect(result.products).toHaveLength(2);
    expect(result.pagination).toEqual({
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    });
  });

  it("builds a case-insensitive text filter when q is present", async () => {
    (Product.countDocuments as any).mockResolvedValue(0);
    const chain = mockChain([]);

    await searchProducts(buildQuery({ q: "wireless" }));

    const filter = (Product.find as any).mock.calls[0][0];

    expect(filter.isActive).toBe(true);
    expect(filter.$or).toHaveLength(2);
    expect(filter.$or[0].name.$regex).toBe("wireless");
    expect(filter.$or[0].name.$options).toBe("i");
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(10);
  });

  it("applies price and category filters", async () => {
    (Product.countDocuments as any).mockResolvedValue(0);
    mockChain([]);

    await searchProducts(
      buildQuery({
        category: "cat1",
        minPrice: 100,
        maxPrice: 500,
      })
    );

    const filter = (Product.find as any).mock.calls[0][0];

    expect(filter.category).toBe("cat1");
    expect(filter.price).toEqual({ $gte: 100, $lte: 500 });
  });

  it("falls back to a safe sort field for unknown sorts", async () => {
    (Product.countDocuments as any).mockResolvedValue(0);
    const chain = mockChain([]);

    await searchProducts(buildQuery({ sort: "evil();drop" }));

    expect(chain.sort).toHaveBeenCalledWith("-createdAt");
  });

  it("does not include inactive products", async () => {
    (Product.countDocuments as any).mockResolvedValue(0);
    mockChain([]);

    await searchProducts(buildQuery({ q: "" }));

    const filter = (Product.find as any).mock.calls[0][0];

    expect(filter.isActive).toBe(true);
    expect(filter.$or).toBeUndefined();
  });
});
