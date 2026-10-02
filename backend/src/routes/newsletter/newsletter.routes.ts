import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import NewsletterSubscriber from "../../models/newsletter/newsletter.model";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { newsletterRateLimiter } from "../../middleware/rateLimit.middleware";

const subscribeSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

const router = Router();

// Public: Subscribe to newsletter
router.post(
  "/subscribe",
  newsletterRateLimiter,
  validate(subscribeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.email.toLowerCase().trim();

      const existing = await NewsletterSubscriber.findOne({ email });

      if (existing) {
        if (!existing.isActive) {
          existing.isActive = true;
          await existing.save();
        }
        return res.status(200).json({
          success: true,
          message: "You are already subscribed to Knottiingale updates! ✨",
        });
      }

      await NewsletterSubscriber.create({ email });

      res.status(201).json({
        success: true,
        message: "Thank you for subscribing to Knottiingale! Check your inbox for cozy crochet drops. ✨",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin: View subscribers
router.get(
  "/",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

      const total = await NewsletterSubscriber.countDocuments({ isActive: true });
      const subscribers = await NewsletterSubscriber.find({ isActive: true })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.status(200).json({
        success: true,
        subscribers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
