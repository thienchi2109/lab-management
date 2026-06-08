#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildVerifyEnvironment,
  getRecursiveVerifyMessage,
} from "./harness-cli-guard-lib.mjs";

const currentFile = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentFile);
const rawCliPath =
  process.env.HARNESS_CLI_RAW ??
  path.join(
    scriptsDir,
    "bin",
    process.platform === "win32" ? "harness-cli.exe" : "harness-cli.raw",
  );
const args = process.argv.slice(2);
const recursiveMessage = getRecursiveVerifyMessage(args, process.env);

if (recursiveMessage) {
  console.error(recursiveMessage);
  process.exit(2);
}

const result = spawnSync(rawCliPath, args, {
  env: buildVerifyEnvironment(args, process.env),
  stdio: "inherit",
});

if (result.error) {
  console.error(`Failed to run Harness CLI binary: ${result.error.message}`);
  process.exit(127);
}

if (result.signal) {
  process.kill(process.pid, result.signal);
}

process.exit(result.status ?? 1);
