"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  ActionMessage,
  type DashboardActionState,
} from "@/components/dashboard/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MAX_IMAGES_PER_SAMPLE,
  type SampleImage,
} from "@/lib/sample-images/operations";

import {
  deleteSampleImageRequest,
  uploadSampleImageRequest,
} from "./sample-image-requests";
import { SampleImageGallery } from "./sample-image-gallery";

type SampleImagesPanelProps = {
  canWrite: boolean;
  initialImages: SampleImage[];
  sampleId: string;
};

type UploadQueueProgress = {
  failures: string[];
  refresh: boolean;
  successCount: number;
};

/** Render Cloudinary evidence images and upload/delete controls. */
export function SampleImagesPanel({
  canWrite,
  initialImages,
  sampleId,
}: SampleImagesPanelProps) {
  const [state, setState] = useState<DashboardActionState>({
    status: "idle",
    message: "",
  });
  const [pending, setPending] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function refreshIfNeeded(result: {
    refresh: boolean;
    state: DashboardActionState;
  }) {
    setState(result.state);

    if (result.refresh) {
      router.refresh();
    }
  }

  async function runPendingAction(
    action: () => Promise<{
      refresh: boolean;
      state: DashboardActionState;
    }>
  ) {
    setPending(true);

    try {
      refreshIfNeeded(await action());
    } finally {
      setPending(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES_PER_SAMPLE - initialImages.length;

    if (remainingSlots <= 0) {
      setState({
        status: "error",
        message: `Mỗi mẫu chỉ được tối đa ${MAX_IMAGES_PER_SAMPLE} ảnh minh chứng.`,
      });
      return;
    }

    const queuedFiles = files.slice(0, remainingSlots);
    const skippedCount = files.length - queuedFiles.length;

    void runPendingAction(() =>
      uploadSampleImageQueue(sampleId, queuedFiles, skippedCount)
    );
  }

  function handleDelete(imageId: string) {
    void runPendingAction(() => deleteSampleImageRequest(sampleId, imageId));
  }

  return (
    <section
      id="sample-result-images"
      className="rounded-lg border bg-background p-3 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Ảnh minh chứng</h2>
            <span className="rounded-full border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {initialImages.length}/{MAX_IMAGES_PER_SAMPLE} ảnh
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, WEBP · tối đa 5 MB/ảnh
          </p>
        </div>
        {canWrite ? (
          <div className="flex gap-2 sm:justify-end">
            <Input
              aria-label="Chụp ảnh mới"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              disabled={pending}
              onChange={handleFileChange}
              ref={cameraInputRef}
              tabIndex={-1}
              type="file"
            />
            <Button
              className="size-11 justify-center px-0 sm:h-9 sm:w-auto sm:px-3"
              disabled={pending}
              onClick={() => cameraInputRef.current?.click()}
              type="button"
            >
              <Camera className="size-4" />
              <span className="sr-only sm:not-sr-only">
                {pending ? "Đang tải ảnh" : "Chụp ảnh"}
              </span>
            </Button>
            <Input
              aria-label="Chọn ảnh từ thư viện"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={pending}
              onChange={handleFileChange}
              ref={libraryInputRef}
              multiple
              tabIndex={-1}
              type="file"
            />
            <Button
              className="size-11 justify-center px-0 sm:h-9 sm:w-auto sm:px-3"
              disabled={pending}
              onClick={() => libraryInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              <ImagePlus className="size-4" />
              <span className="sr-only sm:not-sr-only">Thư viện</span>
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-2">
        <ActionMessage state={state} />
      </div>

      {initialImages.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Chưa có ảnh minh chứng.
        </p>
      ) : (
        <SampleImageGallery
          canDelete={canWrite}
          images={initialImages}
          pending={pending}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}

async function uploadSampleImageQueue(
  sampleId: string,
  files: File[],
  skippedCount: number
) {
  const progress = await files.reduce<Promise<UploadQueueProgress>>(
    (previous, file) =>
      previous.then(async (current) =>
        collectUploadResult(
          current,
          file,
          await uploadSampleImageRequest(sampleId, file)
        )
      ),
    Promise.resolve({ failures: [], refresh: false, successCount: 0 })
  );

  return {
    refresh: progress.refresh,
    state: createQueueState(
      progress.successCount,
      progress.failures,
      skippedCount
    ),
  };
}

function collectUploadResult(
  current: UploadQueueProgress,
  file: File,
  result: Awaited<ReturnType<typeof uploadSampleImageRequest>>
): UploadQueueProgress {
  if (result.state.status === "success") {
    return {
      ...current,
      refresh: current.refresh || result.refresh,
      successCount: current.successCount + 1,
    };
  }

  return {
    ...current,
    failures: [...current.failures, `${file.name}: ${result.state.message}`],
    refresh: current.refresh || result.refresh,
  };
}

function createQueueState(
  successCount: number,
  failures: string[],
  skippedCount: number
): DashboardActionState {
  if (successCount === 0 && failures.length === 0 && skippedCount > 0) {
    return {
      status: "error",
      message: `Mỗi mẫu chỉ được tối đa ${MAX_IMAGES_PER_SAMPLE} ảnh minh chứng.`,
    };
  }

  const parts: string[] = [];

  if (successCount > 0) {
    parts.push(`Đã tải ${successCount} ảnh minh chứng.`);
  }

  if (failures.length > 0) {
    parts.push(`Không thể tải ${failures.length} ảnh: ${failures.join("; ")}`);
  }

  if (skippedCount > 0) {
    parts.push(
      `Đã bỏ qua ${skippedCount} ảnh vì mẫu còn ${successCount + failures.length} vị trí.`
    );
  }

  return {
    status: failures.length > 0 ? "error" : "success",
    message: parts.join(" "),
  };
}
