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

describe("kit inventory schema contract", () => {
  test("defines tenant-scoped individual kits with status and unique code", () => {
    const migrations = readMigrations();

    expect(migrations).toMatch(/create\s+type\s+public\.kit_status\b/i);
    expect(migrations).toMatch(/create\s+table\s+public\.kits\b/i);
    expect(migrations).toMatch(/kit_code\s+text\s+not\s+null/i);
    expect(migrations).toMatch(/status\s+public\.kit_status\s+not\s+null/i);
    expect(migrations).toMatch(
      /create\s+unique\s+index\s+if\s+not\s+exists\s+kits_org_code_key\s+on\s+public\.kits\s*\(\s*organization_id\s*,\s*kit_code\s*\)/i
    );
    expect(migrations).toMatch(
      /alter\s+table\s+public\.kits\s+enable\s+row\s+level\s+security/i
    );
    expect(migrations).toMatch(/create\s+policy\s+[\s\S]+on\s+public\.kits\b/i);
  });
});
