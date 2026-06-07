import type { SaveSampleResultsInput } from "@/lib/sample-results/operations";

type SaveState = {
  status: "idle" | "success" | "error";
  message: string;
};

type SaveRequestResult = {
  state: SaveState;
  refresh: boolean;
};

type SaveFetch = typeof fetch;

/** Save dynamic sample results and normalize transport/API outcomes for the UI. */
export async function saveSampleResultsRequest(
  sampleId: string,
  payload: SaveSampleResultsInput,
  fetcher: SaveFetch = fetch
): Promise<SaveRequestResult> {
  try {
    const response = await fetcher(`/api/samples/${sampleId}/results`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const responsePayload = await response.json();
    const message = readMessage(responsePayload);

    return {
      refresh: response.ok,
      state: {
        status: response.ok ? "success" : "error",
        message:
          message ??
          (response.ok
            ? "Đã lưu kết quả xét nghiệm."
            : "Không thể lưu kết quả xét nghiệm."),
      },
    };
  } catch {
    return {
      refresh: false,
      state: {
        status: "error",
        message: "Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.",
      },
    };
  }
}

function readMessage(value: unknown) {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
