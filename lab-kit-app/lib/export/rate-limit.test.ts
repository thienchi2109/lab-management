import { afterEach, describe, expect, test } from "vitest";

import {
  assertExportRateLimit,
  getExportRateLimitBucketCountForTests,
  resetExportRateLimitForTests,
} from "./rate-limit";

const actor = {
  organizationId: "org-1",
  profileId: "profile-1",
  role: "editor" as const,
};

describe("assertExportRateLimit", () => {
  afterEach(() => {
    delete process.env.EXPORT_RATE_LIMIT_MAX_PER_MINUTE;
    resetExportRateLimitForTests();
  });

  test("cleans expired buckets when another actor exports later", () => {
    assertExportRateLimit({
      actor,
      dataset: "samples",
      now: 0,
    });

    assertExportRateLimit({
      actor: { ...actor, profileId: "profile-2" },
      dataset: "samples",
      now: 60_000,
    });

    expect(getExportRateLimitBucketCountForTests()).toBe(1);
  });
});
