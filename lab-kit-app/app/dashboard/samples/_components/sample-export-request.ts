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

  try {
    const response = await fetcher(endpointFor(input.dataset), {
      body: JSON.stringify(payloadFor(input)),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      return { state: await errorState(response) };
    }

    const blob = await response.blob();
    const filename = filenameFrom(response) ?? fallbackFilename(input);
    const clickDownload = options.clickDownload ?? downloadBlob;

    clickDownload(blob, filename);

    return {
      state: { status: "success", message: "Đã tải file export." },
    };
  } catch {
    return {
      state: {
        status: "error",
        message: "Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.",
      },
    };
  }
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
  for (const segment of header.split(";")) {
    const match = /^\s*([^=]+)=(.*)$/.exec(segment);

    if (!match || match[1]?.trim().toLowerCase() !== name) {
      continue;
    }

    return unquote(match[2]?.trim() ?? "");
  }

  return null;
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
  return value.startsWith('"') && value.endsWith('"')
    ? value.slice(1, -1)
    : value;
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
