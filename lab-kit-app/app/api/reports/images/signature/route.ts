import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createCloudinaryUploadSignature,
  getCloudinaryServerEnv,
  getCloudinaryUploadUrl,
} from "@/lib/sample-images/cloudinary";
import {
  createReportImageFolder,
  createReportImagePublicId,
} from "@/lib/report-images/cloudinary";
import { prepareReportImageUpload } from "@/lib/report-images/operations";
import {
  jsonError,
  parseJsonRequest,
  requireReportImageActor,
  ResponseError,
} from "@/lib/report-images/route-auth";
import { createSupabaseReportImagesPort } from "@/lib/report-images/server";

type SignatureRequest = {
  contentType: string;
  sizeBytes: number;
};

const signatureRequestSchema = z.object({
  contentType: z
    .string()
    .regex(/^image\/[a-z0-9.+-]+$/i, "Content type ảnh không hợp lệ."),
  sizeBytes: z.number().int().positive(),
});

/** Issue signed Cloudinary upload parameters for report image upload. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = await requireReportImageActor(true);
    const input = parseSignatureRequest(
      await parseJsonRequest(
        request,
        "Payload upload ảnh báo cáo không hợp lệ."
      )
    );

    await prepareReportImageUpload(
      actor,
      {
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
      },
      createSupabaseReportImagesPort()
    );

    const env = getCloudinaryServerEnv();
    const folder = createReportImageFolder({
      organizationId: actor.organizationId,
    });
    const signed = createCloudinaryUploadSignature({
      ...env,
      folder,
      publicId: createReportImagePublicId({
        organizationId: actor.organizationId,
      }),
      timestamp: Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({
      ...signed,
      uploadUrl: getCloudinaryUploadUrl(env.cloudName),
    });
  } catch (error) {
    return jsonError(error, "Không thể tạo chữ ký upload ảnh báo cáo.");
  }
}

function parseSignatureRequest(value: unknown): SignatureRequest {
  const result = signatureRequestSchema.safeParse(value);

  if (!result.success) {
    throw new ResponseError(400, "Payload upload ảnh báo cáo không hợp lệ.");
  }

  return result.data;
}
