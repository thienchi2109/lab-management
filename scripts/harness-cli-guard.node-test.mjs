import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildVerifyEnvironment,
  getRecursiveVerifyMessage,
  isStoryVerifyInvocation,
} from "./harness-cli-guard-lib.mjs";

describe("Harness CLI verify recursion guard", () => {
  it("detects story verify invocations", () => {
    assert.equal(isStoryVerifyInvocation(["story", "verify", "US-009C"]), true);
    assert.equal(isStoryVerifyInvocation(["query", "matrix"]), false);
  });

  it("rejects a story verify id already present in the stack", () => {
    const message = getRecursiveVerifyMessage(["story", "verify", "US-009C"], {
      HARNESS_VERIFY_STACK: "US-009,US-009C",
    });

    assert.match(message ?? "", /US-009C/);
    assert.match(message ?? "", /HARNESS_VERIFY_STACK=US-009,US-009C/);
  });

  it("appends a fresh story verify id to the child environment", () => {
    const env = buildVerifyEnvironment(["story", "verify", "US-009D"], {
      HARNESS_VERIFY_STACK: "US-009",
      KEEP: "yes",
    });

    assert.equal(env.HARNESS_VERIFY_STACK, "US-009,US-009D");
    assert.equal(env.KEEP, "yes");
  });
});
