import type { SampleMetadata } from "@/lib/sample-metadata/metadata";

import {
  createSampleMetadataAction,
  updateSampleMetadataAction,
} from "../actions";
import { SampleMetadataClient } from "./sample-metadata-client";

type SampleMetadataPageContentProps = {
  metadata: SampleMetadata;
};

/** Wire server actions into the sample metadata dashboard client surface. */
export function SampleMetadataPageContent({
  metadata,
}: SampleMetadataPageContentProps) {
  return (
    <SampleMetadataClient
      metadata={metadata}
      actions={{
        createSample: createSampleMetadataAction,
        updateSample: updateSampleMetadataAction,
      }}
    />
  );
}
