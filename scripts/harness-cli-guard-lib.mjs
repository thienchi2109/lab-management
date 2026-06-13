const verifyStackKey = "HARNESS_VERIFY_STACK";
const acceptedInputTypes = [
  "new_spec",
  "spec_slice",
  "change_request",
  "new_initiative",
  "maintenance",
  "harness_improvement",
];

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

/** Trả nội dung bổ sung cho help của CLI gốc khi binary chưa mô tả đủ contract. */
export function getHelpSupplement(args) {
  if (!isHelpInvocation(args)) {
    return null;
  }

  if (args[0] === "intake") {
    return `Accepted input types: ${acceptedInputTypes.join(", ")}.`;
  }

  if (args[0] === "story" && (args[1] === "add" || args[1] === "update")) {
    return [
      "--verify sets the story verify-command.",
      "The verify-command is executed as a shell command by story verify <id>.",
      "Use proof commands here, not another story verify call for the same id.",
    ].join("\n");
  }

  return null;
}

function isHelpInvocation(args) {
  return args.includes("--help") || args.includes("-h") || args[0] === "help";
}

function parseVerifyStack(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
