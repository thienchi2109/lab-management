export function collectMissingDocstrings({ changedLines, filePath, source }) {
  const lines = source.split("\n");
  const failures = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (changedLines && !changedLines.has(lineNumber)) return;

    const declaration = getExportedDeclaration(line);
    if (!declaration) return;
    if (hasJsDocBefore(lines, index)) return;

    failures.push({
      filePath,
      line: lineNumber,
      name: declaration.name,
    });
  });

  return failures;
}

function getExportedDeclaration(line) {
  const trimmed = line.trim();

  if (
    !trimmed.startsWith("export ") ||
    trimmed.startsWith("export {") ||
    trimmed.startsWith("export *")
  ) {
    return null;
  }

  const patterns = [
    /^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\b/,
    /^export\s+default\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\b/,
    /^export\s+(?:declare\s+)?class\s+([A-Za-z_$][\w$]*)\b/,
    /^export\s+(?:declare\s+)?interface\s+([A-Za-z_$][\w$]*)\b/,
    /^export\s+type\s+([A-Za-z_$][\w$]*)\b/,
    /^export\s+const\s+([A-Za-z_$][\w$]*)\b/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return { name: match[1] };
  }

  return null;
}

export function getChangedLines(diff) {
  const changedLines = new Set();
  const hunkPattern = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

  for (const line of diff.split("\n")) {
    const match = line.match(hunkPattern);
    if (!match) continue;

    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);

    for (let offset = 0; offset < count; offset += 1) {
      changedLines.add(start + offset);
    }
  }

  return changedLines;
}

function hasJsDocBefore(lines, index) {
  let cursor = index - 1;

  while (cursor >= 0 && lines[cursor].trim() === "") {
    cursor -= 1;
  }

  if (cursor < 0 || !lines[cursor].trim().endsWith("*/")) {
    return false;
  }

  while (cursor >= 0) {
    const current = lines[cursor].trim();
    if (current.startsWith("/**")) return true;
    if (current.startsWith("/*")) return false;
    cursor -= 1;
  }

  return false;
}
