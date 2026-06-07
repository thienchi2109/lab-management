import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { deleteSampleImage } from "@/lib/sample-images/operations";
import {
  jsonError,
  requireSampleImageActor,
} from "@/lib/sample-images/route-auth";
import { createSupabaseSampleImagesPort } from "@/lib/sample-images/server";

type RouteContext = {
  params: Promise<{ imageId: string; sampleId: string }>;
};

/** Delete a Cloudinary-backed evidence image for a tenant-scoped sample. */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { imageId, sampleId } = await context.params;
    const actor = await requireSampleImageActor(true);

    await deleteSampleImage(
      sampleId,
      imageId,
      actor,
      createSupabaseSampleImagesPort()
    );
    revalidatePath("/dashboard/samples");
    revalidatePath(`/dashboard/samples/${sampleId}/results`);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    return jsonError(error, "Không thể xóa ảnh minh chứng.");
  }
}
