"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ActionMessage,
  type DashboardActionState,
} from "@/components/dashboard/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SampleImage } from "@/lib/sample-images/operations";

import {
  deleteSampleImageRequest,
  uploadSampleImageRequest,
} from "./sample-image-requests";

type SampleImagesPanelProps = {
  canWrite: boolean;
  initialImages: SampleImage[];
  sampleId: string;
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
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) return;

    startTransition(async () => {
      refreshIfNeeded(await uploadSampleImageRequest(sampleId, file));
    });
  }

  function handleDelete(imageId: string) {
    startTransition(async () => {
      refreshIfNeeded(await deleteSampleImageRequest(sampleId, imageId));
    });
  }

  return (
    <section className="rounded-lg border bg-background p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-base font-semibold">Ảnh minh chứng</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tối đa 10 ảnh JPEG, PNG hoặc WEBP, mỗi ảnh không quá 5 MB.
          </p>
        </div>
        {canWrite ? (
          <div className="inline-flex">
            <Input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={pending}
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            <Button
              disabled={pending}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <ImagePlus className="size-4" />
              {pending ? "Đang xử lý" : "Tải ảnh"}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-3">
        <ActionMessage state={state} />
      </div>

      {initialImages.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Chưa có ảnh minh chứng.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {initialImages.map((image) => (
            <figure
              key={image.id}
              className="rounded-lg border bg-background p-2"
            >
              <Image
                alt={`Ảnh minh chứng ${image.publicId}`}
                className="aspect-video w-full rounded-md object-cover"
                height={360}
                src={image.secureUrl}
                width={640}
              />
              <figcaption className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{image.contentType}</span>
                {canWrite ? (
                  <Button
                    aria-label="Xóa ảnh"
                    disabled={pending}
                    onClick={() => handleDelete(image.id)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
