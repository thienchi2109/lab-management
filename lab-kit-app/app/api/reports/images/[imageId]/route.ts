import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { deleteReportImage } from "@/lib/report-images/operations";
import {
  jsonError,
  requireReportImageActor,
} from "@/lib/report-images/route-auth";
import { createSupabaseReportImagesPort } from "@/lib/report-images/server";

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

/** Delete a Cloudinary-backed report image for the actor organization. */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const [{ imageId }, actor] = await Promise.all([
      context.params,
      requireReportImageActor(true),
    ]);

    await deleteReportImage(imageId, actor, createSupabaseReportImagesPort());
    revalidatePath("/dashboard/analytics");

    return NextResponse.json({ status: "success" });
  } catch (error) {
    return jsonError(error, "Không thể xóa ảnh báo cáo.");
  }
}
