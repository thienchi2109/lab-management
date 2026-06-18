"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { requestSampleResultView } from "@/components/layout/sample-create-action";

type SampleResultViewerLinkProps = {
  sampleId: string;
  children: string;
  className?: string;
};

/** Render link kết quả giữ route deep link làm fallback khi JS không chạy. */
export function SampleResultViewerLink({
  sampleId,
  children,
  className,
}: SampleResultViewerLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    requestSampleResultView(sampleId);
  }

  return (
    <Link
      className={className}
      href={`/dashboard/samples/${sampleId}/results`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
