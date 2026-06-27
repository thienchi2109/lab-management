import fs from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");
const migrationsDir = path.join(repoRoot, "supabase", "migrations");

function readMigrations() {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => fs.readFileSync(path.join(migrationsDir, file), "utf8"))
    .join("\n");
}

describe("report image schema contract", () => {
  test("keeps report image writes behind service-role audit RPCs", () => {
    const migrations = readMigrations();

    expect(migrations).toMatch(
      /drop\s+policy\s+if\s+exists\s+"admins can insert report images"\s+on\s+public\.report_images/iu
    );
    expect(migrations).toMatch(
      /drop\s+policy\s+if\s+exists\s+"admins can delete report images"\s+on\s+public\.report_images/iu
    );
    expect(migrations).toMatch(
      /grant\s+execute\s+on\s+function\s+public\.create_report_image_with_audit[\s\S]+to\s+service_role/iu
    );
    expect(migrations).toMatch(
      /grant\s+execute\s+on\s+function\s+public\.delete_report_image_with_audit[\s\S]+to\s+service_role/iu
    );
    expect(migrations).not.toMatch(
      /grant\s+execute\s+on\s+function\s+public\.(create|delete)_report_image_with_audit[\s\S]+to\s+authenticated/iu
    );
  });
});
