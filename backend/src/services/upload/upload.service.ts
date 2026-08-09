import cloudinary from "../../config/cloudinary";
import { env } from "../../config/env";

import { BadRequestError } from "../../errors/BadRequestError";

export interface UploadResult {
  url: string;
  publicId: string;
}

const CLOUDINARY_FOLDER =
  env().NODE_ENV === "production" ? "shikha" : "shikha-dev";

export const uploadImage = (
  buffer: Buffer,
  folder?: string
): Promise<UploadResult> => {
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

    stream.end(buffer);
  });
};

export const uploadImages = async (
  buffers: Buffer[],
  folder?: string
): Promise<UploadResult[]> => {
  return Promise.all(
    buffers.map((buffer) => uploadImage(buffer, folder))
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
