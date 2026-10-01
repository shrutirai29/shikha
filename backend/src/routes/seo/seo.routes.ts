import { Router, Request, Response } from "express";
import {
  generateSitemapXml,
  submitToIndexNow,
  INDEXNOW_KEY,
} from "../../services/seo/seo.service";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Sitemap endpoint
router.get(
  "/sitemap.xml",
  asyncHandler(async (_req: Request, res: Response) => {
    const xml = await generateSitemapXml();
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(xml);
  })
);

// IndexNow verification text file
router.get(`/${INDEXNOW_KEY}.txt`, (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(INDEXNOW_KEY);
});

// Admin-only trigger to push URLs to IndexNow
router.post(
  "/api/seo/indexnow/submit",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const { urls } = req.body as { urls?: string[] };
    const defaultUrls = [
      "/",
      "/products",
      "/categories",
      "/contact",
      "/shipping-policy",
    ];

    const result = await submitToIndexNow(urls && urls.length > 0 ? urls : defaultUrls);

    res.status(result.success ? 200 : 400).json(result);
  })
);

export default router;
