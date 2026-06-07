"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { ActionMessage } from "@/components/dashboard/action-message";
import { Button } from "@/components/ui/button";
import type { SampleResultEntry } from "@/lib/sample-results/operations";

import { createSavePayloadFromForm } from "./form-payload";
import { ResultGroupAccordion } from "./result-group-accordion";
import { saveSampleResultsRequest } from "./save-sample-results-request";

type SampleResultsClientProps = {
  entry: SampleResultEntry;
  canWrite: boolean;
};

type SaveState = {
  status: "idle" | "success" | "error";
  message: string;
};

/** Render màn hình nhập kết quả động cho một mẫu xét nghiệm. */
export function SampleResultsClient({
  entry,
  canWrite,
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
      {entry.groups.map((group) => (
        <ResultGroupAccordion
          key={group.id}
          group={group}
          results={results}
          readOnly={!canWrite || pending}
        />
      ))}
    </form>
  );
}
