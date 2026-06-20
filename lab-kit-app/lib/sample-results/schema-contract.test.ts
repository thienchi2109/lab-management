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

function readLatestSampleResultEntryPayloadRpcDefinition() {
  const matches = [
    ...readMigrations().matchAll(
      /create\s+or\s+replace\s+function\s+public\.get_sample_result_entry_payload[\s\S]+?\$\$;/gi
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

  test("uses selected sample result groups as the save whitelist", () => {
    const definition = readLatestSampleResultsRpcDefinition();

    expect(definition).toMatch(
      /from\s+public\.samples[\s\S]+?where[\s\S]+?id\s*=\s*p_sample_id[\s\S]+?organization_id\s*=\s*p_organization_id[\s\S]+?for\s+share/i
    );
    expect(definition).toMatch(
      /valid_sample_groups\s+as\s*\([\s\S]+?from\s+public\.sample_result_groups\s+srg[\s\S]+?for\s+share\s+of\s+srg/i
    );
    expect(definition).toMatch(
      /join\s+valid_sample_groups\s+vsg\s+on\s+vsg\.result_group_id\s*=\s*rm\.result_group_id/i
    );
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

  test("keeps the read payload RPC tenant-scoped and service-role only", () => {
    const definition = readLatestSampleResultEntryPayloadRpcDefinition();
    const migrations = readMigrations();

    expect(definition).toMatch(
      /create\s+or\s+replace\s+function\s+public\.get_sample_result_entry_payload\s*\(\s*p_organization_id\s+uuid\s*,\s*p_sample_id\s+uuid\s*\)/i
    );
    expect(definition).toMatch(/security\s+definer/i);
    expect(definition).toMatch(/set\s+search_path\s*=\s*public/i);
    expect(definition).toMatch(
      /from\s+public\.samples\s+s[\s\S]+?where[\s\S]+?s\.id\s*=\s*p_sample_id[\s\S]+?s\.organization_id\s*=\s*p_organization_id/i
    );
    expect(definition).toMatch(/jsonb_build_object/i);
    expect(migrations).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.get_sample_result_entry_payload\s*\(\s*uuid\s*,\s*uuid\s*\)\s+from\s+public/i
    );
    expect(migrations).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.get_sample_result_entry_payload\s*\(\s*uuid\s*,\s*uuid\s*\)\s+from\s+anon/i
    );
    expect(migrations).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.get_sample_result_entry_payload\s*\(\s*uuid\s*,\s*uuid\s*\)\s+from\s+authenticated/i
    );
    expect(migrations).toMatch(
      /grant\s+execute\s+on\s+function\s+public\.get_sample_result_entry_payload\s*\(\s*uuid\s*,\s*uuid\s*\)\s+to\s+service_role/i
    );
  });
});
