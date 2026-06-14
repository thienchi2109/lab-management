"use client";

import { Button } from "@/components/ui/button";
import { SideSheetFrame } from "@/components/ui/overlay-frame";
import type { SampleMetadataRow } from "@/lib/sample-metadata/metadata";

import {
  billingStatusLabels,
  sampleStatusLabels,
} from "./sample-metadata-labels";

type SampleMetadataViewSheetProps = {
  sample: SampleMetadataRow | null;
  onClose: () => void;
};

const sampleDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

/** Render nội dung xem metadata mẫu bằng side sheet primitive toàn cục. */
export function SampleMetadataViewSheet({
  sample,
  onClose,
}: SampleMetadataViewSheetProps) {
  if (!sample) return null;

  return (
    <SideSheetFrame
      title={`Mẫu ${sample.sampleCode}`}
      closeLabel="Đóng"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">
            {sample.customerName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sampleStatusLabels[sample.status]} ·{" "}
            {billingStatusLabels[sample.billingStatus]} ·{" "}
            {sampleDateFormatter.format(new Date(sample.receivedAt))}
          </p>
        </div>

        <dl className="divide-y rounded-lg border bg-background">
          <DetailRow label="Mã mẫu" value={sample.sampleCode} />
          <DetailRow label="Khách hàng" value={sample.customerName} />
          <DetailRow label="Công ty" value={sample.companyName ?? "Không có"} />
          <DetailRow label="Loại mẫu" value={sample.sampleTypeName} />
          <DetailRow label="Lô KIT" value={sample.kitSummary} />
          <DetailRow
            label="Ngày nhận"
            value={sampleDateFormatter.format(new Date(sample.receivedAt))}
          />
          <DetailRow
            label="Trạng thái"
            value={sampleStatusLabels[sample.status]}
          />
          <DetailRow
            label="Thanh toán"
            value={billingStatusLabels[sample.billingStatus]}
          />
          <DetailRow label="Ghi chú" value={sample.note ?? "Không có"} />
        </dl>
      </div>
    </SideSheetFrame>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
