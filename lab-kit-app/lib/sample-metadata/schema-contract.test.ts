import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "..", "..", "..");
const migrationsDir = path.join(repoRoot, "supabase", "migrations");

function readMigrations() {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => fs.readFileSync(path.join(migrationsDir, file), "utf8"))
    .join("\n");
}

describe("sample metadata schema contract", () => {
  test("creates samples through an HP random-code transaction RPC", () => {
    const migrations = readMigrations();

    expect(migrations).toMatch(
      /create\s+or\s+replace\s+function\s+public\.create_sample_metadata_with_code/iu
    );
    expect(migrations).toMatch(/security\s+definer/iu);
    expect(migrations).toMatch(/set\s+search_path\s*=\s*public/iu);
    expect(migrations).toMatch(/timezone\('Asia\/Ho_Chi_Minh',\s*now\(\)\)/iu);
    expect(migrations).toMatch(/'HP-'/u);
    expect(migrations).toMatch(/gen_random_bytes/iu);
    expect(migrations).toMatch(/extensions\.gen_random_bytes/iu);
    expect(migrations).toMatch(/for\s+\w+\s+in\s+1\.\.5\s+loop/iu);
    expect(migrations).toMatch(/hashtextextended|md5|sha256|digest/iu);
    expect(migrations).toMatch(/unique_violation/iu);
    expect(migrations).toMatch(/insert\s+into\s+public\.samples/iu);
    expect(migrations).toMatch(/insert\s+into\s+public\.audit_events/iu);
    expect(migrations).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.create_sample_metadata_with_code/iu
    );
    expect(migrations).toMatch(
      /grant\s+execute\s+on\s+function\s+public\.create_sample_metadata_with_code[\s\S]+to\s+service_role/iu
    );
    expect(migrations).not.toMatch(/sample_code_counters/iu);
    expect(migrations).not.toMatch(/max\s*\([^)]*sample_code/iu);
  });
});
