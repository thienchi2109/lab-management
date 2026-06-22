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

describe("sample cost schema contract", () => {
  test("adds durable columns for amount and paid-method reporting", () => {
    const migrations = readMigrations();

    expect(migrations).toMatch(
      /sample_cost_amount_vnd\s+(numeric\s*\(\s*15\s*,\s*0\s*\)|type\s+numeric\s*\(\s*15\s*,\s*0\s*\))/i
    );
    expect(migrations).toMatch(
      /alter\s+table\s+public\.samples[\s\S]+add\s+column\s+if\s+not\s+exists\s+sample_cost_payment_method\s+text/i
    );
    expect(migrations).toMatch(
      /sample_cost_amount_vnd[\s\S]+is\s+null[\s\S]+or[\s\S]+sample_cost_amount_vnd\s*>=\s*0/i
    );
    expect(migrations).toMatch(
      /sample_cost_payment_method[\s\S]+in\s*\(\s*'cash'\s*,\s*'bank_transfer'\s*,\s*'other'\s*\)/i
    );
  });
});
