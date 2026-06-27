import "server-only";

import { createHash } from "node:crypto";

import { z } from "zod";

const cloudinaryEnvSchema = z.object({
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
});

/** Cloudinary credentials and cloud identifier available only on the server. */
export type CloudinaryServerEnv = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
};

/** Input required to sign a direct browser upload request. */
export type CloudinaryUploadSignatureInput = CloudinaryServerEnv & {
  folder: string;
  publicId: string;
  timestamp: number;
};

/** Signed Cloudinary upload parameters safe to return to the browser. */
export type CloudinaryUploadSignature = {
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  signature: string;
  timestamp: number;
};

/** Parse Cloudinary server environment without exposing secrets to clients. */
export function parseCloudinaryServerEnv(input: unknown): CloudinaryServerEnv {
  const result = cloudinaryEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Missing or invalid Cloudinary server environment.");
  }

  return {
    apiKey: result.data.CLOUDINARY_API_KEY,
    apiSecret: result.data.CLOUDINARY_API_SECRET,
    cloudName: result.data.CLOUDINARY_CLOUD_NAME,
  };
}

/** Read Cloudinary server environment from `process.env`. */
export function getCloudinaryServerEnv(): CloudinaryServerEnv {
  return parseCloudinaryServerEnv(process.env);
}

/** Create a SHA-1 Cloudinary signature for signed direct image upload. */
export function createCloudinaryUploadSignature(
  input: CloudinaryUploadSignatureInput
): CloudinaryUploadSignature {
  return {
    apiKey: input.apiKey,
    cloudName: input.cloudName,
    folder: input.folder,
    publicId: input.publicId,
    signature: signCloudinaryParams(
      {
        folder: input.folder,
        public_id: input.publicId,
        timestamp: input.timestamp,
      },
      input.apiSecret
    ),
    timestamp: input.timestamp,
  };
}

/** Build the Cloudinary image upload API URL for a cloud name. */
export function getCloudinaryUploadUrl(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    cloudName
  )}/image/upload`;
}

/** Build the Cloudinary image destroy API URL for a cloud name. */
export function getCloudinaryDestroyUrl(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    cloudName
  )}/image/destroy`;
}

/** Build an optimized Cloudinary delivery URL for a stored public id. */
export function buildCloudinaryDeliveryUrl(input: {
  cloudName: string;
  publicId: string;
}) {
  return `https://res.cloudinary.com/${encodeURIComponent(
    input.cloudName
  )}/image/upload/c_limit,w_640,q_auto,f_auto/${encodePublicId(input.publicId)}`;
}

/** Request deletion of a Cloudinary image asset by public id. */
export async function destroyCloudinaryImage(publicId: string) {
  const env = getCloudinaryServerEnv();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams(
    { invalidate: true, public_id: publicId, timestamp },
    env.apiSecret
  );
  const body = new URLSearchParams({
    api_key: env.apiKey,
    invalidate: "true",
    public_id: publicId,
    signature,
    timestamp: String(timestamp),
  });

  try {
    const response = await fetch(getCloudinaryDestroyUrl(env.cloudName), {
      method: "POST",
      body,
    });

    if (response.ok) {
      return;
    }
  } catch {
    throw new Error("Không thể xóa ảnh trên Cloudinary.");
  }

  throw new Error("Không thể xóa ảnh trên Cloudinary.");
}

function signCloudinaryParams(
  params: Record<string, string | number | boolean>,
  apiSecret: string
) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // Cloudinary yêu cầu SHA-1 cho chữ ký tham số upload/destroy.
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

function encodePublicId(publicId: string) {
  return publicId.split("/").map(encodeURIComponent).join("/");
}
