import multer from "multer";
import { BadRequestError } from "../errors/BadRequestError";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(
        new BadRequestError(
          "Only JPEG, PNG, WebP, GIF and AVIF images are allowed"
        )
      );
      return;
    }

    cb(null, true);
  },
});
