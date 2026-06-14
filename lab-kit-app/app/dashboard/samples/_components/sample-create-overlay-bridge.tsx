"use client";

import { useEffect, useState } from "react";

import {
  sampleCreateRequestedEvent,
  sampleMetadataEditRequestedEvent,
  sampleMetadataViewRequestedEvent,
  type SampleMetadataRequestSample,
} from "@/components/layout/sample-create-action";
import type {
  SampleMetadata,
  SampleMetadataRow,
} from "@/lib/sample-metadata/metadata";

import {
  CreateSampleDialog,
  EditSampleDialog,
} from "./sample-metadata-dialogs";
import type { SampleMetadataDialogAction } from "./sample-metadata-dialog-state";
import { SampleMetadataViewSheet } from "./sample-metadata-view-sheet";

type SampleCreateOverlayBridgeProps = {
  metadata: SampleMetadata;
  formAction: SampleMetadataDialogAction;
  updateAction: SampleMetadataDialogAction;
};

type OverlayState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "view"; sampleId: string; sample: SampleMetadataRow | null }
  | { mode: "edit"; sampleId: string; sample: SampleMetadataRow | null };

const closedState: OverlayState = { mode: "closed" };

/** Mount các overlay metadata mẫu toàn cục trên dashboard shell. */
export function SampleCreateOverlayBridge({
  metadata,
  formAction,
  updateAction,
}: SampleCreateOverlayBridgeProps) {
  const [state, setState] = useState<OverlayState>(closedState);

  useEffect(() => {
    function handleCreateRequest() {
      setState({ mode: "create" });
    }

    function handleViewRequest(event: Event) {
      const request = getRequestedSample(event);
      if (request) setState({ mode: "view", ...request });
    }

    function handleEditRequest(event: Event) {
      const request = getRequestedSample(event);
      if (request) setState({ mode: "edit", ...request });
    }

    window.addEventListener(sampleCreateRequestedEvent, handleCreateRequest);
    window.addEventListener(
      sampleMetadataViewRequestedEvent,
      handleViewRequest
    );
    window.addEventListener(
      sampleMetadataEditRequestedEvent,
      handleEditRequest
    );
    return () => {
      window.removeEventListener(
        sampleCreateRequestedEvent,
        handleCreateRequest
      );
      window.removeEventListener(
        sampleMetadataViewRequestedEvent,
        handleViewRequest
      );
      window.removeEventListener(
        sampleMetadataEditRequestedEvent,
        handleEditRequest
      );
    };
  }, []);

  const selectedSample =
    state.mode === "view" || state.mode === "edit"
      ? (metadata.samples.find((sample) => sample.id === state.sampleId) ??
        state.sample)
      : null;

  return (
    <>
      <CreateSampleDialog
        open={state.mode === "create"}
        formAction={formAction}
        onClose={() => setState(closedState)}
        {...metadata}
      />
      <SampleMetadataViewSheet
        sample={state.mode === "view" ? selectedSample : null}
        onClose={() => setState(closedState)}
      />
      <EditSampleDialog
        sample={state.mode === "edit" ? selectedSample : null}
        formAction={updateAction}
        onClose={() => setState(closedState)}
        {...metadata}
      />
    </>
  );
}

function getRequestedSample(event: Event) {
  if (!(event instanceof CustomEvent)) return null;
  const sampleId =
    typeof event.detail?.sampleId === "string" ? event.detail.sampleId : null;

  if (!sampleId) return null;

  return {
    sampleId,
    sample: event.detail?.sample
      ? toSampleMetadataRow(event.detail.sample)
      : null,
  };
}

function toSampleMetadataRow(
  sample: SampleMetadataRequestSample
): SampleMetadataRow {
  return {
    ...sample,
    collectedAt: sample.collectedAt ?? null,
    note: sample.note ?? null,
  };
}
