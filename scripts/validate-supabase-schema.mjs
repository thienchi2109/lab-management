#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationPath = path.join(
  root,
  "supabase/migrations/202606030001_initial_schema.sql",
);
const migrationsDir = path.join(root, "supabase/migrations");
const advisorFixMigrationPath = path.join(
  root,
  "supabase/migrations/202606040002_advisor_fixes.sql",
);
const usernameAuthMigrationPath = path.join(
  root,
  "supabase/migrations/202606040003_username_auth_alias.sql",
);
const resultConfigAuditMigrationPath = path.join(
  root,
  "supabase/migrations/202606050007_result_configuration_audit_transaction_rpcs.sql",
);
const resultTemplateAuditMigrationPath = path.join(
  root,
  "supabase/migrations/202606050008_result_template_audit_transaction_rpcs.sql",
);
const seedPath = path.join(root, "supabase/seed.sql");
const envExamplePath = path.join(root, "lab-kit-app/.env.example");

const requiredTables = [
  "organizations",
  "profiles",
  "tenant_memberships",
  "sample_types",
  "kit_types",
  "kit_batches",
  "kits",
  "samples",
  "sample_images",
  "result_groups",
  "result_metrics",
  "result_templates",
  "result_template_metrics",
  "sample_results",
  "sample_group_conclusions",
  "audit_events",
];

const tenantScopedTables = [
  "tenant_memberships",
  "sample_types",
  "kit_types",
  "kit_batches",
  "kits",
  "samples",
  "sample_images",
  "result_groups",
  "result_metrics",
  "result_templates",
  "result_template_metrics",
  "sample_results",
  "sample_group_conclusions",
  "audit_events",
];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(root, filePath)}`);
  }

  return fs.readFileSync(filePath, "utf8");
}

function readAllMigrations() {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => readFile(path.join(migrationsDir, file)))
    .join("\n");
}

function assertContains(content, pattern, message) {
  if (!pattern.test(content)) {
    throw new Error(message);
  }
}

function main() {
  const migration = readFile(migrationPath);
  const allMigrations = readAllMigrations();
  const advisorFixMigration = readFile(advisorFixMigrationPath);
  const usernameAuthMigration = readFile(usernameAuthMigrationPath);
  const resultConfigAuditMigration = readFile(resultConfigAuditMigrationPath);
  const resultTemplateAuditMigration = readFile(
    resultTemplateAuditMigrationPath,
  );
  const seed = readFile(seedPath);
  const envExample = readFile(envExamplePath);

  for (const table of requiredTables) {
    assertContains(
      table === "kits" ? allMigrations : migration,
      new RegExp(`create\\s+table\\s+public\\.${table}\\b`, "i"),
      `Missing table public.${table}`,
    );
  }

  for (const table of tenantScopedTables) {
    assertContains(
      table === "kits" ? allMigrations : migration,
      new RegExp(
        `alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`,
        "i",
      ),
      `Missing RLS enablement for public.${table}`,
    );
    assertContains(
      table === "kits" ? allMigrations : migration,
      new RegExp(`create\\s+policy\\s+[^;]+\\s+on\\s+public\\.${table}\\b`, "is"),
      `Missing policy for public.${table}`,
    );
  }

  assertContains(
    allMigrations,
    /create\s+type\s+public\.kit_status/i,
    "Kit inventory migration must add public.kit_status",
  );
  assertContains(
    allMigrations,
    /create\s+unique\s+index\s+if\s+not\s+exists\s+kits_org_code_key\s+on\s+public\.kits\s*\(\s*organization_id\s*,\s*kit_code\s*\)/i,
    "Kit inventory migration must enforce unique kit codes per organization",
  );
  assertContains(
    migration,
    /create\s+schema\s+if\s+not\s+exists\s+private/i,
    "Missing private schema for non-exposed helper functions",
  );
  assertContains(
    migration,
    /security\s+definer/i,
    "Missing security definer helper for RLS membership checks",
  );
  assertContains(
    migration,
    /set\s+search_path\s*=\s*private,\s*public/i,
    "Security definer helper must pin search_path",
  );
  assertContains(
    migration,
    /create\s+index\b/i,
    "Missing indexes for lookup and RLS performance",
  );
  assertContains(
    migration,
    /auth\.uid\(\)\s+is\s+not\s+null/i,
    "RLS policies must explicitly reject unauthenticated requests",
  );
  assertContains(
    advisorFixMigration,
    /create\s+index\s+if\s+not\s+exists\s+samples_sample_type_id_idx/i,
    "Advisor fix migration must add missing foreign-key indexes",
  );
  assertContains(
    advisorFixMigration,
    /drop\s+policy\s+if\s+exists\s+"editors can manage samples"/i,
    "Advisor fix migration must remove overlapping FOR ALL manager policies",
  );
  assertContains(
    advisorFixMigration,
    /for\s+insert\s+to\s+authenticated/i,
    "Advisor fix migration must replace manager policies with action-specific policies",
  );
  assertContains(
    usernameAuthMigration,
    /alter\s+table\s+public\.profiles\s+add\s+column\s+if\s+not\s+exists\s+username\s+text/i,
    "Username auth migration must add public.profiles.username",
  );
  assertContains(
    usernameAuthMigration,
    /create\s+unique\s+index\s+if\s+not\s+exists\s+profiles_username_lower_key\s+on\s+public\.profiles\s*\(\s*lower\(username\)\s*\)/i,
    "Username auth migration must add normalized unique username index",
  );
  assertContains(
    usernameAuthMigration,
    /check\s*\(\s*username\s+is\s+null\s+or\s+username\s*~\s*'\^\[a-z0-9_\]\{3,32\}\$'/i,
    "Username auth migration must constrain normalized username format",
  );
  assertContains(
    resultConfigAuditMigration,
    /create\s+or\s+replace\s+function\s+public\.insert_result_configuration_audit/i,
    "Result configuration audit migration must add a shared audit helper",
  );
  assertContains(
    resultConfigAuditMigration,
    /create\s+or\s+replace\s+function\s+public\.create_result_group_with_audit/i,
    "Result configuration audit migration must add group create RPC",
  );
  assertContains(
    resultConfigAuditMigration,
    /create\s+or\s+replace\s+function\s+public\.update_result_metric_with_audit/i,
    "Result configuration audit migration must add metric update RPC",
  );
  assertContains(
    resultTemplateAuditMigration,
    /create\s+or\s+replace\s+function\s+public\.replace_result_template_metrics_with_audit/i,
    "Template assignment migration must add audited replacement RPC",
  );
  assertContains(
    `${resultConfigAuditMigration}\n${resultTemplateAuditMigration}`,
    /security\s+definer/is,
    "Result configuration audit RPCs must use security definer",
  );
  assertContains(
    `${resultConfigAuditMigration}\n${resultTemplateAuditMigration}`,
    /set\s+search_path\s*=\s*public/is,
    "Result configuration audit RPCs must pin search_path",
  );
  assertContains(
    `${resultConfigAuditMigration}\n${resultTemplateAuditMigration}`,
    /revoke\s+all\s+on\s+function\s+public\.create_result_group_with_audit[\s\S]+from\s+authenticated/i,
    "Result configuration write RPCs must not be exposed to authenticated clients",
  );
  assertContains(
    `${resultConfigAuditMigration}\n${resultTemplateAuditMigration}`,
    /grant\s+execute\s+on\s+function\s+public\.replace_result_template_metrics_with_audit[\s\S]+to\s+service_role/i,
    "Result configuration write RPCs must be callable by service_role",
  );

  assertContains(seed, /Demo Lab/i, "Seed must include demo organization data");
  assertContains(seed, /PCR_REALTIME/i, "Seed must include PCR realtime config");
  assertContains(seed, /KQ_CHUNG/i, "Seed must include KQ_CHUNG metric config");

  assertContains(
    envExample,
    /^NEXT_PUBLIC_SUPABASE_URL=/m,
    "Missing public Supabase URL env contract",
  );
  assertContains(
    envExample,
    /^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=/m,
    "Missing public Supabase publishable key env contract",
  );
  if (/NEXT_PUBLIC_.*(SECRET|SERVICE_ROLE)/i.test(envExample)) {
    throw new Error("Secret/service role keys must not use NEXT_PUBLIC_*");
  }

  console.log("Supabase schema contract passed.");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
