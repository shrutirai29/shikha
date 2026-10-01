import Product from "../../models/product/product.model";
import Category from "../../models/category/category.model";
import { env } from "../../config/env";

export const INDEXNOW_KEY = "4b88a9139f3c4db886a45749f7e4f3a2";

/**
 * Dynamically generates a valid sitemap.xml including all active
 * products, categories, and public static storefront routes.
 */
export const generateSitemapXml = async (): Promise<string> => {
  const config = env();
  const rawBase = config.CLIENT_URL || "https://knottiingale.com";
  const baseUrl = rawBase.replace(/\/+$/, "");

  const staticRoutes = [
    { path: "", changefreq: "daily", priority: "1.0" },
    { path: "/products", changefreq: "daily", priority: "0.9" },
    { path: "/categories", changefreq: "weekly", priority: "0.8" },
    { path: "/contact", changefreq: "monthly", priority: "0.6" },
    { path: "/privacy", changefreq: "monthly", priority: "0.5" },
    { path: "/terms", changefreq: "monthly", priority: "0.5" },
    { path: "/shipping-policy", changefreq: "monthly", priority: "0.5" },
    { path: "/refund-policy", changefreq: "monthly", priority: "0.5" },
  ];

  // Fetch all active categories
  const categories = await Category.find({ isActive: true })
    .select("slug updatedAt")
    .lean();

  // Fetch all active products
  const products = await Product.find({ isActive: true })
    .select("slug updatedAt images")
    .lean();

  const nowIso = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Static routes
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
    xml += `    <lastmod>${nowIso}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Category pages
  for (const cat of categories) {
    const lastMod = cat.updatedAt
      ? new Date(cat.updatedAt).toISOString().split("T")[0]
      : nowIso;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/categories/${cat.slug}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // Product detail pages
  for (const prod of products) {
    const lastMod = prod.updatedAt
      ? new Date(prod.updatedAt).toISOString().split("T")[0]
      : nowIso;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/products/${prod.slug}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    if (prod.images && prod.images.length > 0 && prod.images[0]) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${prod.images[0]}</image:loc>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return xml;
};

/**
 * Submits URL list directly to the IndexNow API (Bing, Yandex, etc.)
 * for instantaneous indexing.
 */
export const submitToIndexNow = async (
  urls: string[]
): Promise<{ success: boolean; status: number; message: string }> => {
  const config = env();
  const rawBase = config.CLIENT_URL || "https://knottiingale.com";
  const host = new URL(rawBase).hostname;
  const baseUrl = rawBase.replace(/\/+$/, "");

  const fullUrls = urls.map((u) => (u.startsWith("http") ? u : `${baseUrl}${u.startsWith("/") ? "" : "/"}${u}`));

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
    urlList: fullUrls,
  };

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      return {
        success: true,
        status: response.status,
        message: `Successfully submitted ${fullUrls.length} URLs to IndexNow.`,
      };
    }

    const text = await response.text();
    return {
      success: false,
      status: response.status,
      message: `IndexNow returned status ${response.status}: ${text || "Bad Request"}`,
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: `Failed to submit to IndexNow: ${error?.message || "Network error"}`,
    };
  }
};
