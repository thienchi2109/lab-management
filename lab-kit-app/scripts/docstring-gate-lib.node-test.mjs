import assert from "node:assert/strict";
import test from "node:test";

import { collectMissingDocstrings } from "./docstring-gate-lib.mjs";

test("reports changed exported declarations without JSDoc", () => {
  const source = [
    "export function createThing() {",
    "  return true;",
    "}",
    "",
    "/** Create a documented thing. */",
    "export const documentedThing = () => true;",
    "",
  ].join("\n");

  const failures = collectMissingDocstrings({
    changedLines: new Set([1, 6]),
    filePath: "app/example.ts",
    source,
  });

  assert.deepEqual(
    failures.map(({ line, name }) => ({ line, name })),
    [{ line: 1, name: "createThing" }]
  );
});

test("ignores barrel re-exports and unchanged legacy exports", () => {
  const source = [
    "export function legacyThing() {",
    "  return true;",
    "}",
    "",
    "export { SharedThing } from './shared-thing';",
    "",
  ].join("\n");

  const failures = collectMissingDocstrings({
    changedLines: new Set([5]),
    filePath: "app/example.ts",
    source,
  });

  assert.deepEqual(failures, []);
});
