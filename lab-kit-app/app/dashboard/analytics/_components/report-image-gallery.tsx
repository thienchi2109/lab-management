"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2, Upload } from "lucide-react";

import { ActionMessage } from "@/components/dashboard/action-message";
import type { DashboardActionState } from "@/components/dashboard/action-message";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  deleteReportImageRequest,
  type ReportImageView,
  uploadReportImageRequest,
} from "./report-image-requests";

type ReportImageGalleryProps = {
  canManage: boolean;
  initialImages: ReportImageView[];
};

const idleState: DashboardActionState = { message: "", status: "idle" };

/** Render gallery ảnh báo cáo chung trong tab Báo cáo. */
export function ReportImageGallery({
  canManage,
  initialImages,
}: ReportImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState(initialImages);
  const [actionState, setActionState] = useState(idleState);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const isFull = images.length >= 20;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!file || isFull) return;

    setIsWorking(true);
    const result = await uploadReportImageRequest(file);
    setActionState(result.state);
    if (result.image) setImages((current) => [result.image!, ...current]);
    setIsWorking(false);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;

    setIsWorking(true);
    const result = await deleteReportImageRequest(pendingDeleteId);
    setActionState(result.state);
    if (result.imageId) {
      setImages((current) =>
        current.filter((image) => image.id !== result.imageId)
      );
    }
    setPendingDeleteId(null);
    setIsWorking(false);
  }

  return (
    <section className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Gallery ảnh báo cáo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ảnh báo cáo chung để Viewer xem, tách riêng ảnh minh chứng theo mẫu.
          </p>
        </div>
        {canManage ? (
          <>
            <input
              ref={inputRef}
              type="file"
              aria-label="Chọn ảnh báo cáo"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void handleFileChange(event)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isWorking || isFull}
              className="w-full gap-2 sm:w-auto"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              {isFull ? "Đã đủ 20 ảnh" : "Tải ảnh báo cáo"}
            </Button>
          </>
        ) : null}
      </div>

      <div className="mt-3">
        <ActionMessage state={actionState} />
      </div>

      {images.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-lg border bg-background"
            >
              <Image
                src={image.secureUrl}
                alt="Ảnh báo cáo"
                width={640}
                height={480}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="truncate text-xs text-muted-foreground">
                  {formatSize(image.sizeBytes)}
                </span>
                {canManage ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Xóa ảnh báo cáo"
                    disabled={isWorking}
                    onClick={() => setPendingDeleteId(image.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed bg-background p-6 text-center">
          <ImageIcon className="size-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Chưa có ảnh báo cáo</p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Xóa ảnh báo cáo?"
        description="Ảnh sẽ bị xóa khỏi gallery báo cáo và Cloudinary."
        confirmLabel="Xóa ảnh"
        cancelLabel="Hủy"
        intent="destructive"
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}

function formatSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}
