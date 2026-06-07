import type { DashboardActionState } from "@/components/dashboard/action-message";

type Fetcher = typeof fetch;

type RequestResult = {
  refresh: boolean;
  state: DashboardActionState;
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

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Upload one image through signed Cloudinary params and confirm metadata. */
export async function uploadSampleImageRequest(
  sampleId: string,
  file: File,
  fetcher: Fetcher = fetch
): Promise<RequestResult> {
  const validation = validateFile(file);

  if (validation) {
    return error(validation);
  }

  try {
    const signatureResponse = await fetcher(
      "/api/uploads/cloudinary/signature",
      {
        method: "POST",
        body: JSON.stringify({
          contentType: file.type,
          sampleId,
          sizeBytes: file.size,
        }),
      }
    );

    if (!signatureResponse.ok) {
      const signatureError = await readJsonOrNull(signatureResponse);
      return error(
        readMessage(signatureError) ?? "Không thể tạo chữ ký upload."
      );
    }

    const signature = await readJson<SignatureResponse>(signatureResponse);
    const uploadResponse = await fetcher(signature.uploadUrl, {
      method: "POST",
      body: createCloudinaryForm(file, signature),
    });
    const uploaded = await readJson<CloudinaryUploadResponse>(uploadResponse);

    if (!uploadResponse.ok) {
      return error("Không thể upload ảnh lên Cloudinary.");
    }

    const confirmResponse = await fetcher(`/api/samples/${sampleId}/images`, {
      method: "POST",
      body: JSON.stringify({
        contentType: file.type,
        publicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
        sizeBytes: uploaded.bytes,
      }),
    });

    if (!confirmResponse.ok) {
      return error("Không thể ghi nhận ảnh minh chứng.");
    }

    return success("Đã tải ảnh minh chứng.");
  } catch {
    return error("Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.");
  }
}

/** Delete a persisted evidence image through the sample image API. */
export async function deleteSampleImageRequest(
  sampleId: string,
  imageId: string,
  fetcher: Fetcher = fetch
): Promise<RequestResult> {
  try {
    const response = await fetcher(
      `/api/samples/${sampleId}/images/${imageId}`,
      {
        method: "DELETE",
      }
    );

    return response.ok
      ? success("Đã xóa ảnh minh chứng.")
      : error("Không thể xóa ảnh minh chứng.");
  } catch {
    return error("Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.");
  }
}

function validateFile(file: File) {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WEBP.";
  }

  if (file.size > MAX_SIZE_BYTES) {
    return "Ảnh minh chứng không được vượt quá 5 MB.";
  }

  return null;
}

function createCloudinaryForm(file: File, signature: SignatureResponse) {
  const formData = new FormData();
  formData.set("api_key", signature.apiKey);
  formData.set("file", file);
  formData.set("folder", signature.folder);
  formData.set("public_id", signature.publicId);
  formData.set("signature", signature.signature);
  formData.set("timestamp", String(signature.timestamp));
  return formData;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function readJsonOrNull(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function success(message: string): RequestResult {
  return { refresh: true, state: { status: "success", message } };
}

function error(message: string): RequestResult {
  return { refresh: false, state: { status: "error", message } };
}

function readMessage(value: unknown) {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
