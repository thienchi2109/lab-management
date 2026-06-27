import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import {
  confirmReportImageUpload,
  getReportImages,
  type ConfirmReportImageInput,
} from "@/lib/report-images/operations";
import {
  jsonError,
  requireReportImageActor,
  ResponseError,
} from "@/lib/report-images/route-auth";
import { createSupabaseReportImagesPort } from "@/lib/report-images/server";

/** Return Cloudinary-backed report images for the actor organization. */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const actor = await requireReportImageActor(false);
    const images = await getReportImages(
      actor,
      createSupabaseReportImagesPort()
    );

    return NextResponse.json({ canManage: actor.canManage, images });
  } catch (error) {
    return jsonError(error, "Không thể tải ảnh báo cáo.");
  }
}

/** Confirm direct Cloudinary upload metadata and persist a report image row. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = await requireReportImageActor(true);
    const result = await confirmReportImageUpload(
      actor,
      parseConfirmInput(await request.json()),
      createSupabaseReportImagesPort()
    );

    revalidatePath("/dashboard/analytics");

    return NextResponse.json({ imageId: result.imageId, status: "success" });
  } catch (error) {
    return jsonError(error, "Không thể ghi nhận ảnh báo cáo.");
  }
}

function parseConfirmInput(value: unknown): ConfirmReportImageInput {
  if (!isRecord(value)) {
    throw new ResponseError(400, "Payload ảnh báo cáo không hợp lệ.");
  }

  if (
    typeof value.contentType !== "string" ||
    typeof value.publicId !== "string" ||
    typeof value.secureUrl !== "string" ||
    typeof value.sizeBytes !== "number"
  ) {
    throw new ResponseError(400, "Payload ảnh báo cáo không hợp lệ.");
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
