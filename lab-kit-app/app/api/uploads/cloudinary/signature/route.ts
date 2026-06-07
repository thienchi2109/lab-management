import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createCloudinaryUploadSignature,
  createSampleImageFolder,
  createSampleImagePublicId,
  getCloudinaryServerEnv,
  getCloudinaryUploadUrl,
} from "@/lib/sample-images/cloudinary";
import { prepareSampleImageUpload } from "@/lib/sample-images/operations";
import {
  jsonError,
  requireSampleImageActor,
  ResponseError,
} from "@/lib/sample-images/route-auth";
import { createSupabaseSampleImagesPort } from "@/lib/sample-images/server";

type SignatureRequest = {
  contentType: string;
  sampleId: string;
  sizeBytes: number;
};

const signatureRequestSchema = z.object({
  contentType: z
    .string()
    .regex(/^image\/[a-z0-9.+-]+$/i, "Content type ảnh không hợp lệ."),
  sampleId: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

/** Issue signed Cloudinary upload parameters for browser direct upload. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = await requireSampleImageActor(true);
    const input = parseSignatureRequest(await request.json());

    await prepareSampleImageUpload(
      input.sampleId,
      actor,
      {
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
      },
      createSupabaseSampleImagesPort()
    );

    const env = getCloudinaryServerEnv();
    const folder = createSampleImageFolder({
      organizationId: actor.organizationId,
      sampleId: input.sampleId,
    });
    const signed = createCloudinaryUploadSignature({
      ...env,
      folder,
      publicId: createSampleImagePublicId({
        organizationId: actor.organizationId,
        sampleId: input.sampleId,
      }),
      timestamp: Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({
      ...signed,
      uploadUrl: getCloudinaryUploadUrl(env.cloudName),
    });
  } catch (error) {
    return jsonError(error, "Không thể tạo chữ ký upload Cloudinary.");
  }
}

function parseSignatureRequest(value: unknown): SignatureRequest {
  const result = signatureRequestSchema.safeParse(value);

  if (!result.success) {
    throw new ResponseError(400, "Payload upload ảnh không hợp lệ.");
  }

  return result.data;
}
