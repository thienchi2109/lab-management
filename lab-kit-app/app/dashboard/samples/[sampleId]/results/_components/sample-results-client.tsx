"use client";

import {
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
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

type ResultSectionTab = "summary" | "results" | "images";

const sampleDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const resultSectionTabs = [
  ["summary", "Thông tin mẫu"],
  ["results", "Kết quả"],
  ["images", "Ảnh"],
] as const;

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
  const [activeTab, setActiveTab] = useState<ResultSectionTab>("summary");
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
      className="mx-auto flex w-full max-w-5xl flex-col gap-3"
    >
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Kết quả mẫu {entry.sample.sampleCode}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Template: {entry.template.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      <ResultSectionTabs activeTab={activeTab} onChange={setActiveTab} />
      <ResultSectionPanel activeTab={activeTab} tab="summary">
        <SampleSummary entry={entry} />
      </ResultSectionPanel>
      <ResultSectionPanel activeTab={activeTab} tab="results">
        <section className="grid gap-2" aria-labelledby="sample-result-details">
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
      </ResultSectionPanel>
      <ResultSectionPanel activeTab={activeTab} tab="images">
        <SampleImagesPanel
          canWrite={canWrite}
          initialImages={initialImages}
          sampleId={entry.sample.id}
        />
      </ResultSectionPanel>
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
    <section
      id="sample-result-summary"
      className="rounded-lg border bg-background p-3"
    >
      <h2 className="text-base font-semibold">Thông tin mẫu</h2>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-md border p-2">
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

function ResultSectionTabs({
  activeTab,
  onChange,
}: {
  activeTab: ResultSectionTab;
  onChange: (tab: ResultSectionTab) => void;
}) {
  return (
    <div
      aria-label="Nội dung kết quả mẫu"
      className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1"
      role="tablist"
    >
      {resultSectionTabs.map(([tab, label]) => {
        const selected = activeTab === tab;

        return (
          <button
            aria-controls={getResultTabPanelId(tab)}
            aria-selected={selected}
            className={
              selected
                ? "rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-xs"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-background hover:text-foreground"
            }
            id={getResultTabId(tab)}
            key={tab}
            onClick={() => onChange(tab)}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ResultSectionPanel({
  activeTab,
  children,
  tab,
}: {
  activeTab: ResultSectionTab;
  children: ReactNode;
  tab: ResultSectionTab;
}) {
  return (
    <div
      aria-labelledby={getResultTabId(tab)}
      hidden={activeTab !== tab}
      id={getResultTabPanelId(tab)}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

function getResultTabId(tab: ResultSectionTab) {
  return `sample-result-${tab}-tab`;
}

function getResultTabPanelId(tab: ResultSectionTab) {
  return `sample-result-${tab}-panel`;
}

function formatDate(value: string) {
  return sampleDateFormatter.format(new Date(value));
}
