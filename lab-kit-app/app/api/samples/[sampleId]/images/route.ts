import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import {
  confirmSampleImageUpload,
  getSampleImages,
  type ConfirmSampleImageInput,
} from "@/lib/sample-images/operations";
import {
  jsonError,
  requireSampleImageActor,
  ResponseError,
} from "@/lib/sample-images/route-auth";
import { createSupabaseSampleImagesPort } from "@/lib/sample-images/server";

type RouteContext = {
  params: Promise<{ sampleId: string }>;
};

/** Return Cloudinary-backed evidence images for a tenant-scoped sample. */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { sampleId } = await context.params;
    const actor = await requireSampleImageActor(false);
    const images = await getSampleImages(
      sampleId,
      actor,
      createSupabaseSampleImagesPort()
    );

    return NextResponse.json({ canWrite: actor.canWrite, images });
  } catch (error) {
    return jsonError(error, "Không thể tải ảnh minh chứng.");
  }
}

/** Confirm direct Cloudinary upload metadata and persist a sample image row. */
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { sampleId } = await context.params;
    const actor = await requireSampleImageActor(true);
    const result = await confirmSampleImageUpload(
      sampleId,
      actor,
      parseConfirmInput(await request.json()),
      createSupabaseSampleImagesPort()
    );

    revalidatePath("/dashboard/samples");
    revalidatePath(`/dashboard/samples/${sampleId}/results`);

    return NextResponse.json({ status: "success", imageId: result.imageId });
  } catch (error) {
    return jsonError(error, "Không thể ghi nhận ảnh minh chứng.");
  }
}

function parseConfirmInput(value: unknown): ConfirmSampleImageInput {
  if (!isRecord(value)) {
    throw new ResponseError(400, "Payload ảnh minh chứng không hợp lệ.");
  }

  if (
    typeof value.contentType !== "string" ||
    typeof value.publicId !== "string" ||
    typeof value.secureUrl !== "string" ||
    typeof value.sizeBytes !== "number"
  ) {
    throw new ResponseError(400, "Payload ảnh minh chứng không hợp lệ.");
  }

  return {
    contentType: value.contentType,
    publicId: value.publicId,
    secureUrl: value.secureUrl,
    sizeBytes: value.sizeBytes,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
