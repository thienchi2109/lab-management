#!/usr/bin/env node
import { accessSync, constants, readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd, exit } from "node:process";

const root = cwd();
const appPackagePath = join(root, "lab-kit-app", "package.json");
const setupPath = join(root, "scripts", "setup-git-hooks.sh");
const preCommitPath = join(root, ".githooks", "pre-commit");
const prePushPath = join(root, ".githooks", "pre-push");

const packageJson = JSON.parse(readFileSync(appPackagePath, "utf8"));
const scripts = packageJson.scripts ?? {};

const expectations = [
  [
    "package script react-doctor",
    scripts["react-doctor"] ===
      "npm exec --yes --package react-doctor@latest -- react-doctor . --no-telemetry --fail-on error",
  ],
  [
    "package script react-doctor:staged",
    scripts["react-doctor:staged"] ===
      "npm exec --yes --package react-doctor@latest -- react-doctor . --staged --no-telemetry --fail-on error",
  ],
  [
    "package script react-doctor:diff",
    scripts["react-doctor:diff"] ===
      "npm exec --yes --package react-doctor@latest -- react-doctor . --diff --no-telemetry --fail-on error",
  ],
  ["quality script includes React Doctor", /\bbun run react-doctor\b/.test(scripts.quality ?? "")],
  ["setup script exists", isExecutable(setupPath)],
  ["pre-commit hook exists", isExecutable(preCommitPath)],
  ["pre-push hook exists", isExecutable(prePushPath)],
  [
    "pre-commit runs staged React Doctor gate",
    fileIncludes(preCommitPath, "bun run react-doctor:staged"),
  ],
  ["pre-push runs diff React Doctor gate", fileIncludes(prePushPath, "bun run react-doctor:diff")],
  ["setup script configures hooksPath", fileIncludes(setupPath, "git config core.hooksPath .githooks")],
];

const failures = expectations.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length > 0) {
  console.error("React Doctor gate verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  exit(1);
}

console.log("React Doctor gate verification passed.");

function isExecutable(path) {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function fileIncludes(path, value) {
  try {
    return readFileSync(path, "utf8").includes(value);
  } catch {
    return false;
  }
}
