import type { ExportFormat } from "@/lib/export/query";
import type { SampleGridQuery } from "@/lib/sample-grid/query";

/** Giới hạn dòng export mặc định của UI, độc lập với page size hiện tại. */
export const SAMPLE_GRID_EXPORT_ROW_LIMIT = 1_000;

/** Dataset export được hỗ trợ trực tiếp từ bảng mẫu. */
export type SampleGridExportDataset = "results-normalized" | "samples";

/** Trạng thái request export đã normalize cho UI. */
export type SampleGridExportState = {
  status: "error" | "success";
  message: string;
};

type RequestSampleGridExportInput = {
  dataset: SampleGridExportDataset;
  format: ExportFormat;
  query: SampleGridQuery;
  rowLimit?: number;
};

type RequestSampleGridExportOptions = {
  clickDownload?: (blob: Blob, filename: string) => void;
  fetcher?: typeof fetch;
};

const sampleFields = [
  "sampleCode",
  "customerName",
  "sampleType",
  "kitBatch",
  "status",
  "billingStatus",
  "receivedAt",
  "updatedAt",
] as const;
const normalizedResultsFields = [
  "sampleCode",
  "customerName",
  "sampleType",
  "status",
  "receivedAt",
  "groupCode",
  "groupName",
  "metricCode",
  "metricName",
  "metricUnit",
  "value",
  "kqChung",
] as const;

/** Gọi endpoint export tương ứng và tải file về trình duyệt. */
export async function requestSampleGridExport(
  input: RequestSampleGridExportInput,
  options: RequestSampleGridExportOptions = {}
): Promise<{ state: SampleGridExportState }> {
  const fetcher = options.fetcher ?? fetch;
  let response: Response;

  try {
    response = await fetcher(endpointFor(input.dataset), {
      body: JSON.stringify(payloadFor(input)),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  } catch {
    return { state: networkErrorState() };
  }

  if (!response.ok) {
    return { state: await errorState(response) };
  }

  try {
    const blob = await response.blob();
    const filename = filenameFrom(response) ?? fallbackFilename(input);
    const clickDownload = options.clickDownload ?? downloadBlob;

    clickDownload(blob, filename);
  } catch {
    return { state: genericExportErrorState() };
  }

  return {
    state: { status: "success", message: "Đã tải file export." },
  };
}

function endpointFor(dataset: SampleGridExportDataset) {
  return dataset === "samples"
    ? "/api/export/samples"
    : "/api/export/results-normalized";
}

function payloadFor(input: RequestSampleGridExportInput) {
  return {
    dataset: input.dataset,
    fields:
      input.dataset === "samples" ? sampleFields : normalizedResultsFields,
    filters: input.query.filters,
    format: input.format,
    rowLimit: input.rowLimit ?? SAMPLE_GRID_EXPORT_ROW_LIMIT,
    ...(input.query.search ? { search: input.query.search } : {}),
    sort: input.query.sort,
  };
}

async function errorState(response: Response): Promise<SampleGridExportState> {
  const payload = await readJson(response);

  if (readErrorCode(payload) === "export_row_limit_exceeded") {
    return {
      status: "error",
      message: "File vượt giới hạn dòng. Vui lòng thu hẹp bộ lọc rồi thử lại.",
    };
  }

  return {
    status: "error",
    message:
      readMessage(payload) ?? "Không thể export dữ liệu. Vui lòng thử lại.",
  };
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readErrorCode(value: unknown) {
  return isRecord(value) && typeof value.error === "string"
    ? value.error
    : null;
}

function readMessage(value: unknown) {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : null;
}

function filenameFrom(response: Response) {
  const header = response.headers.get("content-disposition");

  if (!header) {
    return null;
  }

  return parseDispositionFilename(header);
}

function parseDispositionFilename(header: string) {
  const encodedFilename = readDispositionParam(header, "filename*");

  if (encodedFilename) {
    return decodeDispositionFilename(encodedFilename);
  }

  return readDispositionParam(header, "filename");
}

function readDispositionParam(header: string, name: string) {
  for (const segment of splitDispositionSegments(header)) {
    const separator = findParamSeparator(segment);

    if (separator === -1) {
      continue;
    }

    const paramName = segment.slice(0, separator).trim().toLowerCase();

    if (paramName !== name) {
      continue;
    }

    return unquote(segment.slice(separator + 1).trim());
  }

  return null;
}

function splitDispositionSegments(header: string) {
  const segments: string[] = [];
  let segment = "";
  let escaped = false;
  let quoted = false;

  for (const char of header) {
    if (escaped) {
      segment += char;
      escaped = false;
      continue;
    }

    if (quoted && char === "\\") {
      segment += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      segment += char;
      continue;
    }

    if (!quoted && char === ";") {
      segments.push(segment);
      segment = "";
      continue;
    }

    segment += char;
  }

  segments.push(segment);

  return segments;
}

function findParamSeparator(segment: string) {
  for (let index = 0; index < segment.length; index += 1) {
    if (segment[index] === "=") {
      return index;
    }
  }

  return -1;
}

function decodeDispositionFilename(value: string) {
  const encodedValue = value.match(/^[^']*'[^']*'(.*)$/)?.[1] ?? value;

  try {
    return decodeURIComponent(encodedValue);
  } catch {
    return encodedValue;
  }
}

function unquote(value: string) {
  if (!value.startsWith('"') || !value.endsWith('"')) {
    return value;
  }

  let result = "";
  let escaped = false;

  for (const char of value.slice(1, -1)) {
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    result += char;
  }

  return escaped ? `${result}\\` : result;
}

function networkErrorState(): SampleGridExportState {
  return {
    status: "error",
    message: "Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.",
  };
}

function genericExportErrorState(): SampleGridExportState {
  return {
    status: "error",
    message: "Không thể tải file export. Vui lòng thử lại.",
  };
}

function fallbackFilename(input: RequestSampleGridExportInput) {
  const prefix =
    input.dataset === "samples" ? "mau-xet-nghiem" : "ket-qua-chuan-hoa";

  return `${prefix}.${input.format}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
