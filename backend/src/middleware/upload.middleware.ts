import multer from "multer";
import path from "path";
import { BadRequestError } from "../errors/BadRequestError";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    // 1. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      cb(
        new BadRequestError(
          "Only JPEG, PNG, WebP, GIF, and AVIF image formats are allowed"
        )
      );
      return;
    }

    // 2. Validate file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(
        new BadRequestError(
          `Invalid file extension (${ext || "none"}). Only .jpg, .jpeg, .png, .webp, .gif, .avif are allowed`
        )
      );
      return;
    }

    // 3. Reject filenames containing directory traversal or null bytes
    if (file.originalname.includes("..") || file.originalname.includes("\0")) {
      cb(new BadRequestError("Invalid or unsafe filename"));
      return;
    }

    cb(null, true);
  },
});
