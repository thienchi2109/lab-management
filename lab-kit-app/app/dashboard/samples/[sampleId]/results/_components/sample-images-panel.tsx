"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) return;

    if (initialImages.length >= 10) {
      setState({
        status: "error",
        message: "Mỗi mẫu chỉ được tối đa 10 ảnh minh chứng.",
      });
      return;
    }

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
    <section
      id="sample-result-images"
      className="rounded-lg border bg-background p-4"
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-base font-semibold">Ảnh minh chứng</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tối đa 10 ảnh JPEG, PNG hoặc WEBP, mỗi ảnh không quá 5 MB.
          </p>
        </div>
        {canWrite ? (
          <div className="grid gap-2 sm:grid-cols-2 md:flex">
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
              className="h-11 w-full justify-center px-4 md:w-auto"
              disabled={pending}
              onClick={() => cameraInputRef.current?.click()}
              type="button"
            >
              <Camera className="size-4" />
              {pending ? "Đang tải ảnh" : "Chụp ảnh"}
            </Button>
            <Input
              aria-label="Chọn ảnh từ thư viện"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={pending}
              onChange={handleFileChange}
              ref={libraryInputRef}
              tabIndex={-1}
              type="file"
            />
            <Button
              className="h-11 w-full justify-center px-4 md:w-auto"
              disabled={pending}
              onClick={() => libraryInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              <ImagePlus className="size-4" />
              Thư viện
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
          {initialImages.map((image, index) => (
            <figure
              key={image.id}
              className="rounded-lg border bg-background p-2"
            >
              <Image
                alt={`Ảnh minh chứng ${image.publicId}`}
                className="aspect-video w-full rounded-md object-cover"
                height={360}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                src={image.secureUrl}
                width={640}
              />
              <figcaption className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{image.contentType}</span>
                {canWrite ? (
                  <Button
                    aria-label="Xóa ảnh"
                    className="size-9"
                    disabled={pending}
                    onClick={() => handleDelete(image.id)}
                    size="icon"
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
