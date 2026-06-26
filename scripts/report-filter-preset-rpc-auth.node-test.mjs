import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(root, "supabase/migrations");
const appliedMigration = "20260626075430_report_filter_presets.sql";

test("report filter preset RPC has a forward-only admin actor guard", () => {
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const forwardSql = migrationFiles
    .filter((file) => file > appliedMigration)
    .map((file) => fs.readFileSync(path.join(migrationsDir, file), "utf8"))
    .filter((sql) => sql.includes("upsert_report_filter_preset_with_audit"))
    .join("\n")
    .toLowerCase();

  assert.match(
    forwardSql,
    /create or replace function public\.upsert_report_filter_preset_with_audit/,
  );

  const guardIndex = forwardSql.indexOf("public.tenant_memberships");
  const insertIndex = forwardSql.indexOf(
    "insert into public.report_filter_presets",
  );

  assert.ok(guardIndex >= 0, "RPC must check tenant_memberships.");
  assert.ok(insertIndex >= 0, "RPC must still upsert report_filter_presets.");
  assert.ok(guardIndex < insertIndex, "RPC must authorize before writing.");
  assert.match(forwardSql, /tm\.organization_id\s*=\s*p_organization_id/);
  assert.match(forwardSql, /tm\.user_id\s*=\s*p_actor_id/);
  assert.match(forwardSql, /tm\.role\s*=\s*'admin'::public\.app_role/);
  assert.match(forwardSql, /tm\.is_active/);
});

test("report filter preset RPC validates null scope and config explicitly", () => {
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const forwardSql = migrationFiles
    .filter((file) => file > appliedMigration)
    .map((file) => fs.readFileSync(path.join(migrationsDir, file), "utf8"))
    .filter((sql) => sql.includes("upsert_report_filter_preset_with_audit"))
    .join("\n")
    .toLowerCase();

  assert.match(
    forwardSql,
    /p_scope\s+is\s+distinct\s+from\s+'analytics-report-default'/,
  );
  assert.match(forwardSql, /p_config\s+is\s+null/);
  assert.match(forwardSql, /jsonb_typeof\(p_config\)\s+<>\s+'object'/);
});
