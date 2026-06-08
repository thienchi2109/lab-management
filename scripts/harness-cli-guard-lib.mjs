const verifyStackKey = "HARNESS_VERIFY_STACK";

/** Kiểm tra argv có phải `story verify <id>` không. */
export function isStoryVerifyInvocation(args) {
  return args[0] === "story" && args[1] === "verify" && Boolean(args[2]);
}

/** Tạo env truyền xuống CLI gốc, kèm stack story verify hiện tại. */
export function buildVerifyEnvironment(args, env = process.env) {
  const nextEnv = { ...env };

  if (!isStoryVerifyInvocation(args)) {
    return nextEnv;
  }

  const storyId = args[2];
  const stack = parseVerifyStack(env[verifyStackKey]);

  if (!stack.includes(storyId)) {
    stack.push(storyId);
  }

  nextEnv[verifyStackKey] = stack.join(",");
  return nextEnv;
}

/** Trả thông báo lỗi nếu lệnh verify sẽ lặp đệ quy theo stack hiện tại. */
export function getRecursiveVerifyMessage(args, env = process.env) {
  if (!isStoryVerifyInvocation(args)) {
    return null;
  }

  const storyId = args[2];
  const stack = parseVerifyStack(env[verifyStackKey]);

  if (!stack.includes(storyId)) {
    return null;
  }

  return [
    `Harness story verify recursion blocked for ${storyId}.`,
    `HARNESS_VERIFY_STACK=${stack.join(",")}`,
    "The story verify_command must run proof commands, not call story verify for the same story.",
  ].join("\n");
}

function parseVerifyStack(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
