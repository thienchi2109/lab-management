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

describe("sample image schema contract", () => {
  test("guards the image limit inside the transaction RPC", () => {
    const migrations = readMigrations();

    expect(migrations).toMatch(
      /create\s+(or\s+replace\s+)?function\s+public\.create_sample_image_with_audit\b/i
    );
    expect(migrations).toMatch(/from\s+public\.samples[\s\S]+for\s+update/i);
    expect(migrations).toMatch(
      /select\s+count\s*\(\s*\*\s*\)[\s\S]+into\s+current_image_count[\s\S]+from\s+public\.sample_images/i
    );
    expect(migrations).toMatch(
      /if\s+current_image_count\s*>=\s*20\s+then[\s\S]+raise\s+exception\s+'sample image limit reached'/i
    );
    expect(migrations).toMatch(
      /if\s+current_image_count\s*>=\s*20[\s\S]+end\s+if;[\s\S]+insert\s+into\s+public\.sample_images/i
    );
  });
});
