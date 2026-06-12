import type { ExportActor } from "./permissions";
import type { ExportDataset } from "./query";

const DEFAULT_EXPORT_RATE_LIMIT_MAX_PER_MINUTE = 20;
const EXPORT_RATE_LIMIT_WINDOW_MS = 60_000;

type ExportRateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, ExportRateLimitBucket>();

/** Lỗi rate guard export có code ổn định cho API route và audit. */
export class ExportRateLimitError extends Error {
  readonly code = "export_rate_limited";
  readonly status = 429;

  constructor() {
    super("Bạn đang export quá nhanh. Vui lòng chờ một phút rồi thử lại.");
    this.name = "ExportRateLimitError";
  }
}

/** Chặn retry export dồn dập trong một process server, trước khi đọc data port. */
export function assertExportRateLimit(input: {
  actor: ExportActor;
  dataset: ExportDataset;
  now?: number;
}) {
  const maxRequests = readMaxRequestsPerMinute();
  if (maxRequests <= 0) return;

  const now = input.now ?? Date.now();
  pruneExpiredBuckets(now);

  const key = [
    input.actor.organizationId,
    input.actor.profileId,
    input.dataset,
  ].join(":");
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + EXPORT_RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (bucket.count >= maxRequests) {
    throw new ExportRateLimitError();
  }

  bucket.count += 1;
}

/** Reset rate buckets trong Vitest để tránh rò state giữa test cases. */
export function resetExportRateLimitForTests() {
  buckets.clear();
}

/** Đếm bucket rate-limit trong Vitest để khóa cleanup bucket hết hạn. */
export function getExportRateLimitBucketCountForTests() {
  return buckets.size;
}

function readMaxRequestsPerMinute() {
  const parsed = Number(process.env.EXPORT_RATE_LIMIT_MAX_PER_MINUTE);
  if (Number.isInteger(parsed) && parsed >= 0) {
    return parsed;
  }

  return DEFAULT_EXPORT_RATE_LIMIT_MAX_PER_MINUTE;
}

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}
