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
    const responsePayload = (await response.json()) as { message?: string };

    return {
      refresh: response.ok,
      state: {
        status: response.ok ? "success" : "error",
        message:
          responsePayload.message ??
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
