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
 * stay well under Mongo's 16MB document limit.
 */
const MAX_EMBEDDED_IMAGE_SIZE = 2 * 1024 * 1024;

export const uploadImage = (
  source: UploadSource,
  folder?: string
): Promise<UploadResult> => {
  // No Cloudinary credentials: store the image inside MongoDB as a data URL.
  // This keeps uploads working out of the box (survives redeploys) and
  // switches to Cloudinary automatically once credentials are configured.
  if (!isCloudinaryConfigured()) {
    if (source.buffer.length > MAX_EMBEDDED_IMAGE_SIZE) {
      return Promise.reject(
        new BadRequestError(
          "Image is too large (max 2MB). Add Cloudinary credentials to enable larger uploads."
        )
      );
    }

    return Promise.resolve({
      url: `data:${source.mimetype};base64,${source.buffer.toString("base64")}`,
      publicId: "",
    });
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
