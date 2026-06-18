"use client";

import { useEffect, useState } from "react";

import {
  sampleResultViewRequestedEvent,
  type SampleResultViewRequestDetail,
} from "@/components/layout/sample-create-action";
import { SideSheetFrame } from "@/components/ui/overlay-frame";
import type { SampleImage } from "@/lib/sample-images/operations";
import type { SampleResultEntry } from "@/lib/sample-results/operations";

import { SampleResultsClient } from "../[sampleId]/results/_components/sample-results-client";

type ResultEntryResponse = SampleResultEntry & {
  canWrite: boolean;
};

type ImagesResponse = {
  images: SampleImage[];
};

type ViewerState =
  | { mode: "closed" }
  | { mode: "loading"; sampleId: string }
  | {
      mode: "ready";
      sampleId: string;
      entry: SampleResultEntry;
      images: SampleImage[];
      canWrite: boolean;
    }
  | { mode: "error"; sampleId: string; message: string };

const closedState: ViewerState = { mode: "closed" };

/** Mount viewer kết quả mẫu dạng side sheet trên trang danh sách mẫu. */
export function SampleResultViewer() {
  const [state, setState] = useState<ViewerState>(closedState);

  useEffect(() => {
    function handleRequest(event: Event) {
      const sampleId = getRequestedSampleId(event);
      if (sampleId) setState({ mode: "loading", sampleId });
    }

    window.addEventListener(sampleResultViewRequestedEvent, handleRequest);
    return () => {
      window.removeEventListener(sampleResultViewRequestedEvent, handleRequest);
    };
  }, []);

  useEffect(() => {
    if (state.mode !== "loading") return;

    const { sampleId } = state;
    let cancelled = false;

    async function loadViewer() {
      try {
        const [entry, images] = await Promise.all([
          fetchJson<ResultEntryResponse>(`/api/samples/${sampleId}/results`),
          fetchJson<ImagesResponse>(`/api/samples/${sampleId}/images`),
        ]);

        if (!cancelled) {
          setState({
            mode: "ready",
            sampleId,
            entry,
            images: images.images,
            canWrite: entry.canWrite,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            mode: "error",
            sampleId,
            message:
              error instanceof Error
                ? error.message
                : "Không thể tải viewer kết quả.",
          });
        }
      }
    }

    void loadViewer();

    return () => {
      cancelled = true;
    };
  }, [state]);

  if (state.mode === "closed") return null;

  function handleClose() {
    if (
      state.mode === "ready" &&
      state.canWrite &&
      !window.confirm("Đóng viewer kết quả? Hãy lưu thay đổi trước khi đóng.")
    ) {
      return;
    }

    setState(closedState);
  }

  const title =
    state.mode === "ready"
      ? `Kết quả mẫu ${state.entry.sample.sampleCode}`
      : "Kết quả mẫu";

  return (
    <SideSheetFrame
      title={title}
      closeLabel="Đóng viewer"
      onClose={handleClose}
    >
      {state.mode === "loading" ? (
        <p className="text-sm text-muted-foreground">Đang tải kết quả mẫu...</p>
      ) : null}
      {state.mode === "error" ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      {state.mode === "ready" ? (
        <SampleResultsClient
          canWrite={state.canWrite}
          entry={state.entry}
          initialImages={state.images}
        />
      ) : null}
    </SideSheetFrame>
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: unknown };
    if (typeof payload.message === "string") return payload.message;
  } catch {
    return "Không thể tải viewer kết quả.";
  }

  return "Không thể tải viewer kết quả.";
}

function getRequestedSampleId(event: Event) {
  if (!(event instanceof CustomEvent)) return null;
  const detail = event.detail as Partial<SampleResultViewRequestDetail>;
  return typeof detail.sampleId === "string" ? detail.sampleId : null;
}
