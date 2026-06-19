"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { DialogFrame } from "@/components/ui/overlay-frame";
import type { SampleImage } from "@/lib/sample-images/operations";

type SampleImageGalleryProps = {
  canDelete: boolean;
  images: SampleImage[];
  pending: boolean;
  onDelete: (imageId: string) => void;
};

/** Render grid ảnh minh chứng và preview lớn chỉ đọc theo từng mẫu. */
export function SampleImageGallery({
  canDelete,
  images,
  pending,
  onDelete,
}: SampleImageGalleryProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewImage =
    previewIndex === null ? null : (images[previewIndex] ?? null);

  function closePreview() {
    setPreviewIndex(null);
  }

  function movePreview(offset: -1 | 1) {
    setPreviewIndex((current) => {
      if (current === null) return current;
      return Math.min(Math.max(current + offset, 0), images.length - 1);
    });
  }

  return (
    <>
      <div
        aria-hidden={previewImage ? true : undefined}
        className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2 lg:grid-cols-4"
      >
        {images.map((image, index) => (
          <figure
            key={image.id}
            className="group relative overflow-hidden rounded-lg border bg-muted/30"
          >
            <button
              aria-label={`Mở ảnh minh chứng ${index + 1}`}
              className="block w-full overflow-hidden text-left outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => setPreviewIndex(index)}
              type="button"
            >
              <Image
                alt={`Ảnh minh chứng ${image.publicId}`}
                className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                height={320}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 25vw, 33vw"
                src={image.secureUrl}
                width={320}
              />
            </button>
            <figcaption className="pointer-events-none absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
              <span className="rounded-full bg-[#101828]/85 px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
                #{index + 1}
              </span>
              <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[#101828]">
                {formatContentType(image.contentType)}
              </span>
            </figcaption>
              {canDelete ? (
                <Button
                  aria-label={`Xóa ảnh minh chứng ${index + 1}`}
                  className="absolute right-1 top-1 size-11 border border-white/80 bg-white/90 text-destructive shadow-sm hover:bg-white"
                  disabled={pending}
                  onClick={() => onDelete(image.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
          </figure>
        ))}
      </div>

      {previewImage && previewIndex !== null ? (
        <DialogFrame
          title={`Ảnh minh chứng ${previewIndex + 1}/${images.length}`}
          closeLabel="Đóng preview"
          onClose={closePreview}
        >
          <div className="-m-4 flex max-h-[calc(100dvh-4rem)] flex-col gap-3 bg-[#101828] p-3 text-white sm:m-0 sm:max-h-[calc(100dvh-9rem)] sm:rounded-lg">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-md bg-black/30">
              <Image
                alt={`Xem ảnh minh chứng ${getImageName(previewImage)}`}
                className="max-h-[calc(100dvh-13rem)] w-full object-contain sm:max-h-[calc(100dvh-17rem)]"
                height={900}
                priority
                sizes="(min-width: 768px) 80vw, 100vw"
                src={previewImage.secureUrl}
                width={1200}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                aria-label="Ảnh trước"
                className="size-11 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                disabled={previewIndex === 0}
                onClick={() => movePreview(-1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <p className="min-w-0 truncate text-center text-xs font-medium text-white/75">
                {formatContentType(previewImage.contentType)} ·{" "}
                {getImageName(previewImage)}
              </p>

              <Button
                aria-label="Ảnh tiếp theo"
                className="size-11 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                disabled={previewIndex === images.length - 1}
                onClick={() => movePreview(1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {canDelete ? (
              <Button
                aria-label={`Xóa ảnh minh chứng ${previewIndex + 1}`}
                className="size-11 w-full justify-center bg-destructive text-destructive-foreground sm:w-auto sm:self-end sm:px-3"
                disabled={pending}
                onClick={() => onDelete(previewImage.id)}
                type="button"
                variant="destructive"
              >
                <Trash2 className="size-4" />
                Xóa ảnh
              </Button>
            ) : null}
          </div>
        </DialogFrame>
      ) : null}
    </>
  );
}

function getImageName(image: SampleImage) {
  return image.publicId.split("/").at(-1) ?? image.publicId;
}

function formatContentType(contentType: string) {
  return contentType.split("/").at(-1)?.toUpperCase() ?? contentType;
}
