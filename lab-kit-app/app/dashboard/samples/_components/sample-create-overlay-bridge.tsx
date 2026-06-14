"use client";

import { useEffect, useState } from "react";

import { sampleCreateRequestedEvent } from "@/components/layout/sample-create-action";
import type { SampleMetadata } from "@/lib/sample-metadata/metadata";

import { CreateSampleDialog } from "./sample-metadata-dialogs";
import type { SampleMetadataDialogAction } from "./sample-metadata-dialog-state";

type SampleCreateOverlayBridgeProps = {
  metadata: SampleMetadata;
  formAction: SampleMetadataDialogAction;
};

/** Mount the global sample-create overlay on the Samples route. */
export function SampleCreateOverlayBridge({
  metadata,
  formAction,
}: SampleCreateOverlayBridgeProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleCreateRequest() {
      setOpen(true);
    }

    window.addEventListener(sampleCreateRequestedEvent, handleCreateRequest);
    return () => {
      window.removeEventListener(
        sampleCreateRequestedEvent,
        handleCreateRequest
      );
    };
  }, []);

  return (
    <CreateSampleDialog
      open={open}
      formAction={formAction}
      onClose={() => setOpen(false)}
      {...metadata}
    />
  );
}
