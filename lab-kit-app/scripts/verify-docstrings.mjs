#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { cwd, env, exit } from "node:process";

import {
  collectMissingDocstrings,
  getChangedLines,
} from "./docstring-gate-lib.mjs";

const appRoot = cwd();
const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  cwd: appRoot,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
}).trim();
const baseRef = env.DOCSTRING_BASE_REF ?? findBaseRef();
const files = getChangedSourceFiles(baseRef);
const failures = [];

for (const file of files) {
  const absolutePath = join(repoRoot, file);
  if (!existsSync(absolutePath)) continue;

  const diff = git(["diff", "--unified=0", `${baseRef}...HEAD`, "--", file]);
  const changedLines = getChangedLines(diff);
  const source = readFileSync(absolutePath, "utf8");
  const filePath = relative(appRoot, absolutePath);

  failures.push(
    ...collectMissingDocstrings({
      changedLines,
      filePath,
      source,
    })
  );
}

if (failures.length > 0) {
  console.error("Docstring gate failed:");
  for (const failure of failures) {
    console.error(
      `- ${failure.filePath}:${failure.line} export ${failure.name} needs a JSDoc block`
    );
  }
  exit(1);
}

console.log(`Docstring gate passed (${files.length} changed source files).`);

function getChangedSourceFiles(base) {
  const output = git([
    "diff",
    "--name-only",
    "--diff-filter=ACMRT",
    `${base}...HEAD`,
    "--",
    "lab-kit-app/**/*.ts",
    "lab-kit-app/**/*.tsx",
  ]);

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => !shouldSkipFile(file));
}

function shouldSkipFile(file) {
  return (
    file.endsWith(".d.ts") ||
    file.includes(".test.") ||
    file.includes("/__tests__/") ||
    file.endsWith(".config.ts") ||
    file.endsWith("next-env.d.ts")
  );
}

function findBaseRef() {
  for (const candidate of ["origin/main", "main", "HEAD~1"]) {
    if (canResolve(candidate)) return candidate;
  }

  console.error(
    "Docstring gate failed: cannot resolve origin/main, main, or HEAD~1."
  );
  exit(1);
}

function canResolve(ref) {
  try {
    git(["rev-parse", "--verify", `${ref}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function git(args) {
  return execFileSync("git", args, {
    cwd: repoRoot ?? appRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}
