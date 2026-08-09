import sharp from "sharp";
import cloudinary from "../../config/cloudinary";
import { env } from "../../config/env";

import { BadRequestError } from "../../errors/BadRequestError";

export interface UploadSource {
  buffer: Buffer;
  mimetype: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
}

const CLOUDINARY_FOLDER =
  env().NODE_ENV === "production" ? "shikha" : "shikha-dev";

const isCloudinaryConfigured = (): boolean => {
  const config = env();

  return Boolean(
    config.CLOUDINARY_CLOUD_NAME &&
      config.CLOUDINARY_API_KEY &&
      config.CLOUDINARY_API_SECRET
  );
};

/**
 * Max size (bytes) for images stored directly in MongoDB as data URLs.
 * Used only when Cloudinary is not configured, so product documents
 * stay well under Mongo's 16MB document limit. Images are compressed
 * before storage, so phone photos typically end up a few hundred KB.
 */
const MAX_EMBEDDED_IMAGE_SIZE = 2 * 1024 * 1024;

/**
 * Compresses an image so it can be embedded in MongoDB without
 * blowing up document sizes. Animated GIFs are kept as-is.
 */
const compressForEmbedding = async (
  source: UploadSource
): Promise<{ buffer: Buffer; mimetype: string }> => {
  const format = source.mimetype.split("/")[1] ?? "jpeg";

  if (format === "gif") {
    return { buffer: source.buffer, mimetype: source.mimetype };
  }

  const pipeline = sharp(source.buffer)
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    });

  switch (format) {
    case "png":
      return {
        buffer: await pipeline.png({ quality: 80, compressionLevel: 9 }).toBuffer(),
        mimetype: "image/png",
      };
    case "webp":
      return {
        buffer: await pipeline.webp({ quality: 80 }).toBuffer(),
        mimetype: "image/webp",
      };
    case "avif":
      return {
        buffer: await pipeline.avif({ quality: 70 }).toBuffer(),
        mimetype: "image/avif",
      };
    default:
      return {
        buffer: await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer(),
        mimetype: "image/jpeg",
      };
  }
};

export const uploadImage = async (
  source: UploadSource,
  folder?: string
): Promise<UploadResult> => {
  // No Cloudinary credentials: store the image inside MongoDB as a data URL.
  // This keeps uploads working out of the box (survives redeploys) and
  // switches to Cloudinary automatically once credentials are configured.
  if (!isCloudinaryConfigured()) {
    let buffer = source.buffer;
    let mimetype = source.mimetype;

    try {
      const compressed = await compressForEmbedding(source);
      buffer = compressed.buffer;
      mimetype = compressed.mimetype;
    } catch {
      // Fall back to the original buffer if compression fails
    }

    if (buffer.length > MAX_EMBEDDED_IMAGE_SIZE) {
      throw new BadRequestError(
        "Image is too large (max 2MB even after compression). Add Cloudinary credentials to enable larger uploads."
      );
    }

    return {
      url: `data:${mimetype};base64,${buffer.toString("base64")}`,
      publicId: "",
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder ?? CLOUDINARY_FOLDER,
        resource_type: "image",
        transformation: [
          {
            width: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(
            new BadRequestError(
              "Image upload failed, please try again"
            )
          );
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(source.buffer);
  });
};

export const uploadImages = async (
  sources: UploadSource[],
  folder?: string
): Promise<UploadResult[]> => {
  return Promise.all(
    sources.map((source) => uploadImage(source, folder))
  );
};

export const deleteImage = async (
  publicId: string
): Promise<void> => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId);
};

/**
 * Extracts the Cloudinary public_id from a secure URL so the asset
 * can be deleted later.
 */
export const getPublicIdFromUrl = (
  url: string
): string | null => {
  const match = url.match(/\/([^/]+)\.[a-z0-9]+$/i);

  if (!match) {
    return null;
  }

  const filename = match[1];

  // Cloudinary public_ids include the folder path
  const folderMatch = url.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);

  if (!folderMatch) {
    return filename;
  }

  const path = folderMatch[1].replace(/\.[a-z0-9]+$/i, "");

  return path;
};
