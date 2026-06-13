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

function readLatestSampleResultsRpcDefinition() {
  const matches = [
    ...readMigrations().matchAll(
      /create\s+or\s+replace\s+function\s+public\.save_sample_results_with_audit[\s\S]+?\$\$;/gi
    ),
  ];

  return matches.at(-1)?.[0] ?? "";
}

describe("sample results schema contract", () => {
  test("saves result rows and group conclusions through set-based RPC statements", () => {
    const definition = readLatestSampleResultsRpcDefinition();

    expect(definition).toMatch(
      /create\s+or\s+replace\s+function\s+public\.save_sample_results_with_audit\b/i
    );
    expect(definition).toMatch(/security\s+definer/i);
    expect(definition).toMatch(/set\s+search_path\s*=\s*public/i);
    expect(definition).toMatch(/jsonb_(to_recordset|array_elements)/i);
    expect(definition).not.toMatch(
      /\bfor\s+\w+\s+in\s+select[\s\S]+?\bloop\b/i
    );
    expect(definition).toMatch(
      /insert\s+into\s+public\.sample_results[\s\S]+select[\s\S]+from\s+parsed_results[\s\S]+on\s+conflict\s*\(\s*sample_id\s*,\s*result_metric_id\s*\)/i
    );
    expect(definition).toMatch(
      /insert\s+into\s+public\.sample_group_conclusions[\s\S]+select[\s\S]+from\s+parsed_conclusions[\s\S]+on\s+conflict\s*\(\s*sample_id\s*,\s*result_group_id\s*\)/i
    );
  });

  test("deduplicates repeated result metrics and group conclusions before upsert", () => {
    const definition = readLatestSampleResultsRpcDefinition();

    expect(definition).toMatch(/with\s+ordinality/i);
    expect(definition).toMatch(/distinct\s+on\s*\(\s*metric_id\s*\)/i);
    expect(definition).toMatch(/distinct\s+on\s*\(\s*group_id\s*\)/i);
  });

  test("keeps the audit RPC restricted to service role execution", () => {
    const migrations = readMigrations();

    expect(migrations).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.save_sample_results_with_audit\s*\(\s*uuid\s*,\s*uuid\s*,\s*uuid\s*,\s*jsonb\s*,\s*jsonb\s*,\s*jsonb\s*\)\s+from\s+public/i
    );
    expect(migrations).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.save_sample_results_with_audit\s*\(\s*uuid\s*,\s*uuid\s*,\s*uuid\s*,\s*jsonb\s*,\s*jsonb\s*,\s*jsonb\s*\)\s+from\s+anon/i
    );
    expect(migrations).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.save_sample_results_with_audit\s*\(\s*uuid\s*,\s*uuid\s*,\s*uuid\s*,\s*jsonb\s*,\s*jsonb\s*,\s*jsonb\s*\)\s+from\s+authenticated/i
    );
    expect(migrations).toMatch(
      /grant\s+execute\s+on\s+function\s+public\.save_sample_results_with_audit\s*\(\s*uuid\s*,\s*uuid\s*,\s*uuid\s*,\s*jsonb\s*,\s*jsonb\s*,\s*jsonb\s*\)\s+to\s+service_role/i
    );
  });
});
