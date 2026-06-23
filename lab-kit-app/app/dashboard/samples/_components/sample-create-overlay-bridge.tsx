"use client";

import { useEffect, useReducer } from "react";

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
  formAction: SampleMetadataDialogAction;
  initialMetadata: SampleMetadata | null;
  loadMetadata: () => Promise<SampleMetadata>;
  updateAction: SampleMetadataDialogAction;
};

type OverlayState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "view"; sampleId: string; sample: SampleMetadataRow | null }
  | { mode: "edit"; sampleId: string; sample: SampleMetadataRow | null };

type RequestedSample = {
  sampleId: string;
  sample: SampleMetadataRow | null;
};

type SampleOverlayState = {
  loadError: string | null;
  metadata: SampleMetadata | null;
  overlay: OverlayState;
};

type SampleOverlayAction =
  | { type: "close" }
  | { type: "metadataLoadFailed"; message: string }
  | { type: "metadataLoaded"; metadata: SampleMetadata }
  | { type: "metadataLoadStarted" }
  | { type: "openCreate" }
  | { type: "openEdit"; request: RequestedSample }
  | { type: "openView"; request: RequestedSample };

const closedState: OverlayState = { mode: "closed" };

function sampleOverlayReducer(
  state: SampleOverlayState,
  action: SampleOverlayAction
): SampleOverlayState {
  switch (action.type) {
    case "close":
      return { ...state, overlay: closedState };
    case "metadataLoadFailed":
      return { ...state, loadError: action.message };
    case "metadataLoaded":
      return { ...state, loadError: null, metadata: action.metadata };
    case "metadataLoadStarted":
      return { ...state, loadError: null };
    case "openCreate":
      return { ...state, loadError: null, overlay: { mode: "create" } };
    case "openEdit":
      return { ...state, overlay: { mode: "edit", ...action.request } };
    case "openView":
      return { ...state, overlay: { mode: "view", ...action.request } };
  }
}

/** Mount các overlay metadata mẫu toàn cục trên dashboard shell. */
export function SampleCreateOverlayBridge({
  formAction,
  initialMetadata,
  loadMetadata,
  updateAction,
}: SampleCreateOverlayBridgeProps) {
  const [{ loadError, metadata, overlay }, dispatch] = useReducer(
    sampleOverlayReducer,
    {
      loadError: null,
      metadata: initialMetadata,
      overlay: closedState,
    }
  );

  useEffect(() => {
    async function loadCreateMetadata() {
      if (metadata) return;
      try {
        dispatch({ type: "metadataLoadStarted" });
        dispatch({ type: "metadataLoaded", metadata: await loadMetadata() });
      } catch {
        dispatch({
          type: "metadataLoadFailed",
          message: "Không thể tải dữ liệu tạo mẫu. Vui lòng thử lại.",
        });
      }
    }

    function handleCreateRequest() {
      void loadCreateMetadata();
      dispatch({ type: "openCreate" });
    }

    function handleViewRequest(event: Event) {
      const request = getRequestedSample(event);
      if (request) dispatch({ type: "openView", request });
    }

    function handleEditRequest(event: Event) {
      const request = getRequestedSample(event);
      if (request) dispatch({ type: "openEdit", request });
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
  }, [loadMetadata, metadata]);

  const selectedSample =
    overlay.mode === "view" || overlay.mode === "edit"
      ? (metadata?.samples.find((sample) => sample.id === overlay.sampleId) ??
        overlay.sample)
      : null;

  return (
    <>
      {metadata ? (
        <CreateSampleDialog
          open={overlay.mode === "create"}
          formAction={formAction}
          onClose={() => dispatch({ type: "close" })}
          {...metadata}
        />
      ) : null}
      {overlay.mode === "create" && loadError ? (
        <p role="alert" className="sr-only">
          {loadError}
        </p>
      ) : null}
      <SampleMetadataViewSheet
        sample={overlay.mode === "view" ? selectedSample : null}
        onClose={() => dispatch({ type: "close" })}
      />
      {metadata ? (
        <EditSampleDialog
          sample={overlay.mode === "edit" ? selectedSample : null}
          formAction={updateAction}
          onClose={() => dispatch({ type: "close" })}
          {...metadata}
        />
      ) : null}
    </>
  );
}

function getRequestedSample(event: Event): RequestedSample | null {
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
