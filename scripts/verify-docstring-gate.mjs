#!/usr/bin/env node
import { accessSync, constants, readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd, exit } from "node:process";

const root = cwd();
const appPackagePath = join(root, "lab-kit-app", "package.json");
const prePushPath = join(root, ".githooks", "pre-push");
const gatePath = join(root, "lab-kit-app", "scripts", "verify-docstrings.mjs");
const gateTestPath = join(
  root,
  "lab-kit-app",
  "scripts",
  "docstring-gate-lib.node-test.mjs"
);

const packageJson = JSON.parse(readFileSync(appPackagePath, "utf8"));
const scripts = packageJson.scripts ?? {};

const expectations = [
  [
    "package script docstring:check",
    scripts["docstring:check"] === "node scripts/verify-docstrings.mjs",
  ],
  [
    "package script test:docstring-gate",
    scripts["test:docstring-gate"] ===
      "node --test scripts/docstring-gate-lib.node-test.mjs",
  ],
  ["docstring gate script exists", isReadable(gatePath)],
  ["docstring gate test exists", isReadable(gateTestPath)],
  ["pre-push hook exists", isExecutable(prePushPath)],
  [
    "pre-push runs docstring gate",
    fileIncludes(prePushPath, "bun run docstring:check"),
  ],
];

const failures = expectations.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length > 0) {
  console.error("Docstring gate verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  exit(1);
}

console.log("Docstring gate verification passed.");

function isExecutable(path) {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function isReadable(path) {
  try {
    accessSync(path, constants.R_OK);
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
