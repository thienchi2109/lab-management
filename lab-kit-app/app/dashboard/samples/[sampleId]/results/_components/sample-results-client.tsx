"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { ActionMessage } from "@/components/dashboard/action-message";
import { Button } from "@/components/ui/button";
import type { SampleImage } from "@/lib/sample-images/operations";
import type { SampleResultEntry } from "@/lib/sample-results/operations";
import { sampleStatusLabels } from "@/lib/sample-metadata/labels";

import { createSavePayloadFromForm } from "./form-payload";
import { ResultGroupAccordion } from "./result-group-accordion";
import { SampleImagesPanel } from "./sample-images-panel";
import { saveSampleResultsRequest } from "./save-sample-results-request";

type SampleResultsClientProps = {
  entry: SampleResultEntry;
  canWrite: boolean;
  initialImages: SampleImage[];
};

type SaveState = {
  status: "idle" | "success" | "error";
  message: string;
};

const sampleDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Render màn hình nhập kết quả động cho một mẫu xét nghiệm. */
export function SampleResultsClient({
  entry,
  canWrite,
  initialImages,
}: SampleResultsClientProps) {
  const [state, setState] = useState<SaveState>({
    status: "idle",
    message: "",
  });
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const results = Object.fromEntries(
    entry.results.map((result) => [result.metricId, result.value])
  );

  function saveForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await saveSampleResultsRequest(
        entry.sample.id,
        createSavePayloadFromForm(entry, formData)
      );

      setState(result.state);

      if (result.refresh) {
        router.refresh();
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveForm(event.currentTarget);
  }

  return (
    <form
      onSubmit={handleSubmit}
      ref={formRef}
      className="mx-auto flex w-full max-w-5xl flex-col gap-5"
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Kết quả mẫu {entry.sample.sampleCode}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Template: {entry.template.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ActionMessage state={state} />
          {canWrite ? (
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                if (formRef.current) saveForm(formRef.current);
              }}
            >
              <Save className="size-4" />
              {pending ? "Đang lưu" : "Lưu kết quả"}
            </Button>
          ) : null}
        </div>
      </div>
      <SampleSummary entry={entry} />
      <section className="grid gap-3" aria-labelledby="sample-result-details">
        <h2 id="sample-result-details" className="text-base font-semibold">
          Kết quả chi tiết
        </h2>
        {entry.groups.map((group) => (
          <ResultGroupAccordion
            key={group.id}
            group={group}
            results={results}
            readOnly={!canWrite || pending}
          />
        ))}
      </section>
      <SampleImagesPanel
        canWrite={canWrite}
        initialImages={initialImages}
        sampleId={entry.sample.id}
      />
    </form>
  );
}

function SampleSummary({ entry }: { entry: SampleResultEntry }) {
  const groupNames = entry.groups.map((group) => group.name).join(", ");
  const fields = [
    ["Mã mẫu", entry.sample.sampleCode],
    ["Ngày nhận", formatDate(entry.sample.receivedAt)],
    ["Loại mẫu", entry.sample.sampleTypeName],
    ["Khách hàng", entry.sample.customerName ?? "Chưa có"],
    ["Công ty", entry.sample.companyName ?? "Chưa có"],
    [
      "Trạng thái",
      sampleStatusLabels[entry.sample.status] ?? entry.sample.status,
    ],
    ["Nhóm chỉ tiêu", groupNames || "Chưa có"],
  ];

  return (
    <section className="rounded-lg border bg-background p-4">
      <h2 className="text-base font-semibold">Thông tin mẫu</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-md border p-3">
            <dt className="text-xs font-medium text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatDate(value: string) {
  return sampleDateFormatter.format(new Date(value));
}
