import type { DashboardActionState } from "@/components/dashboard/action-message";

type Fetcher = typeof fetch;

type RequestResult = {
  image?: ReportImageView;
  imageId?: string;
  state: DashboardActionState;
};

/** View model ảnh báo cáo dùng bởi gallery client. */
export type ReportImageView = {
  id: string;
  contentType: string;
  createdAt: string;
  publicId: string;
  secureUrl: string;
  sizeBytes: number;
};

type SignatureResponse = {
  apiKey: string;
  folder: string;
  publicId: string;
  signature: string;
  timestamp: number;
  uploadUrl: string;
};

type CloudinaryUploadResponse = {
  bytes: number;
  public_id: string;
  secure_url: string;
};

type ConfirmResponse = {
  imageId: string;
};

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const INVALID_UPLOAD_RESPONSE_MESSAGE =
  "Phản hồi upload ảnh báo cáo không hợp lệ.";
const REPORT_IMAGES_ENDPOINT = "/api/reports/images";
const REPORT_IMAGE_SIGNATURE_ENDPOINT = "/api/reports/images/signature";

/** Upload one report image through signed Cloudinary params. */
export async function uploadReportImageRequest(
  file: File,
  fetcher: Fetcher = fetch
): Promise<RequestResult> {
  const validation = validateFile(file);

  if (validation) return error(validation);

  try {
    const signatureResponse = await fetcher(REPORT_IMAGE_SIGNATURE_ENDPOINT, {
      body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }),
      method: "POST",
    });

    if (!signatureResponse.ok) {
      return error(await readError(signatureResponse, "Không thể tạo chữ ký."));
    }

    const signature = await readSignatureResponse(signatureResponse);

    if (!signature) return error(INVALID_UPLOAD_RESPONSE_MESSAGE);

    const uploadResponse = await fetcher(signature.uploadUrl, {
      body: createCloudinaryForm(file, signature),
      method: "POST",
    });

    if (!uploadResponse.ok)
      return error("Không thể upload ảnh lên Cloudinary.");

    const uploaded = await readCloudinaryUploadResponse(uploadResponse);

    if (!uploaded) return error(INVALID_UPLOAD_RESPONSE_MESSAGE);

    const confirmResponse = await fetcher(REPORT_IMAGES_ENDPOINT, {
      body: JSON.stringify({
        contentType: file.type,
        publicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
        sizeBytes: uploaded.bytes,
      }),
      method: "POST",
    });

    if (!confirmResponse.ok) {
      return error(await readError(confirmResponse, "Không thể ghi nhận ảnh."));
    }

    const confirmed = await readConfirmResponse(confirmResponse);

    if (!confirmed) return error(INVALID_UPLOAD_RESPONSE_MESSAGE);

    return {
      image: {
        contentType: file.type,
        createdAt: new Date().toISOString(),
        id: confirmed.imageId,
        publicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
        sizeBytes: uploaded.bytes,
      },
      state: { message: "Đã tải ảnh báo cáo.", status: "success" },
    };
  } catch {
    return error("Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.");
  }
}

/** Delete one persisted report image through the report image API. */
export async function deleteReportImageRequest(
  imageId: string,
  fetcher: Fetcher = fetch
): Promise<RequestResult> {
  try {
    const response = await fetcher(`${REPORT_IMAGES_ENDPOINT}/${imageId}`, {
      method: "DELETE",
    });

    return response.ok
      ? {
          imageId,
          state: { message: "Đã xóa ảnh báo cáo.", status: "success" },
        }
      : error(await readError(response, "Không thể xóa ảnh báo cáo."));
  } catch {
    return error("Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.");
  }
}

function validateFile(file: File) {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return "Định dạng ảnh không được hỗ trợ.";
  }

  if (file.size > MAX_SIZE_BYTES) {
    return "Ảnh báo cáo không được vượt quá 5 MB.";
  }

  return null;
}

function createCloudinaryForm(file: File, signature: SignatureResponse) {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey);
  form.append("folder", signature.folder);
  form.append("public_id", signature.publicId);
  form.append("signature", signature.signature);
  form.append("timestamp", String(signature.timestamp));

  return form;
}

async function readError(response: Response, fallback: string) {
  const payload = await readJsonOrNull(response);

  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

async function readSignatureResponse(response: Response) {
  const payload = await readJsonOrNull(response);
  return isSignatureResponse(payload) ? payload : null;
}

async function readCloudinaryUploadResponse(response: Response) {
  const payload = await readJsonOrNull(response);
  return isCloudinaryUploadResponse(payload) ? payload : null;
}

async function readConfirmResponse(response: Response) {
  const payload = await readJsonOrNull(response);
  return isConfirmResponse(payload) ? payload : null;
}

async function readJsonOrNull(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function isSignatureResponse(value: unknown): value is SignatureResponse {
  return (
    isRecord(value) &&
    typeof value.apiKey === "string" &&
    typeof value.folder === "string" &&
    typeof value.publicId === "string" &&
    typeof value.signature === "string" &&
    typeof value.timestamp === "number" &&
    typeof value.uploadUrl === "string"
  );
}

function isCloudinaryUploadResponse(
  value: unknown
): value is CloudinaryUploadResponse {
  return (
    isRecord(value) &&
    typeof value.bytes === "number" &&
    typeof value.public_id === "string" &&
    typeof value.secure_url === "string"
  );
}

function isConfirmResponse(value: unknown): value is ConfirmResponse {
  return isRecord(value) && typeof value.imageId === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function error(message: string): RequestResult {
  return { state: { message, status: "error" } };
}
