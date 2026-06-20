"use client";

import { Badge } from "@/components/ui/badge";

import { sampleStatusLabels } from "./sample-metadata-labels";

/** Render badge trạng thái mẫu nhất quán cho bảng và card mobile. */
export function SampleGridStatusBadge({ status }: { status: string }) {
  const destructive = status === "archived";

  return (
    <Badge variant={destructive ? "destructive" : "secondary"}>
      {sampleStatusLabels[status as keyof typeof sampleStatusLabels] ?? status}
    </Badge>
  );
}
