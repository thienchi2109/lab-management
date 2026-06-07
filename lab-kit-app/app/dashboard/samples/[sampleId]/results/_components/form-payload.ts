import type {
  SampleResultEntry,
  SaveSampleResultsInput,
} from "@/lib/sample-results/operations";

import {
  groupConclusionFieldName,
  pcrCtFieldName,
  pcrStatusFieldName,
  resultFieldName,
} from "./result-field-names";

/** Convert form controls from the dynamic result UI into the PUT payload. */
export function createSavePayloadFromForm(
  entry: Pick<SampleResultEntry, "groups">,
  formData: FormData
): SaveSampleResultsInput {
  return {
    results: entry.groups.flatMap((group) =>
      group.metrics.flatMap((metric) => {
        const value = valueFromForm(metric.inputType, metric.id, formData);
        return value === null ? [] : [{ metricId: metric.id, value }];
      })
    ),
    groupConclusions: entry.groups.flatMap((group) => {
      const value = formData.get(groupConclusionFieldName(group.id));
      const conclusionText = typeof value === "string" ? value.trim() : "";
      return conclusionText ? [{ groupId: group.id, conclusionText }] : [];
    }),
  };
}

function valueFromForm(
  inputType: string,
  metricId: string,
  formData: FormData
) {
  const name = resultFieldName(metricId);

  switch (inputType) {
    case "number":
    case "percent":
    case "scale_1_5":
      return numberValue(formData.get(name));
    case "boolean":
      return formData.getAll(name).includes("true");
    case "multi_select":
      return formData.getAll(name).filter(isString);
    case "text":
    case "textarea":
      return textValue(formData.get(name));
    case "select":
      return nonEmptyStringValue(formData.get(name));
    case "pcr_qualitative": {
      const status = pcrStatus(formData.get(pcrStatusFieldName(metricId)));
      if (!status) return null;
      return {
        status,
        ct: null,
      };
    }
    case "pcr_realtime": {
      const status = pcrStatus(formData.get(pcrStatusFieldName(metricId)));
      if (!status) return null;
      return {
        status,
        ct: numberValue(formData.get(pcrCtFieldName(metricId))),
      };
    }
    default: {
      return nonEmptyStringValue(formData.get(name));
    }
  }
}

function numberValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pcrStatus(value: FormDataEntryValue | null) {
  return value === "positive" || value === "negative" ? value : null;
}

function textValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : null;
}

function nonEmptyStringValue(value: FormDataEntryValue | null) {
  const text = textValue(value);
  return text ? text : null;
}

function isString(value: FormDataEntryValue): value is string {
  return typeof value === "string";
}
