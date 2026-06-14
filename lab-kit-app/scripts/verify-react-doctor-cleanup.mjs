#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd, exit } from "node:process";

const root = cwd();
const checks = [];

function pathFor(path) {
  return join(root, path);
}

function exists(path) {
  return existsSync(pathFor(path));
}

function file(path) {
  return readFileSync(pathFor(path), "utf8");
}

function jsonFile(path) {
  return JSON.parse(file(path));
}

function check(name, passed) {
  checks.push([name, Boolean(passed)]);
}

const dashboardLayout = file("app/dashboard/layout.tsx");
check(
  "dashboard layout does not render sidebar shell",
  !dashboardLayout.includes("Sidebar") &&
    !dashboardLayout.includes("AppSidebar")
);
check(
  "sidebar source files are removed",
  !exists("components/ui/sidebar.tsx") &&
    !exists("components/layout/sidebar.tsx")
);
check(
  "unused sidebar support files are removed",
  !exists("components/ui/avatar.tsx") &&
    !exists("components/ui/dropdown-menu.tsx") &&
    !exists("components/ui/separator.tsx") &&
    !exists("components/ui/sheet.tsx") &&
    !exists("components/ui/skeleton.tsx") &&
    !exists("hooks/use-mobile.ts")
);

const topbar = file("components/layout/topbar.tsx");
check(
  "topbar does not import sidebar trigger",
  !topbar.includes("SidebarTrigger")
);
check(
  "topbar title mapper is module scoped",
  topbar.includes('from "@/components/layout/page-title"') &&
    !topbar.includes("export function getPageTitle") &&
    exists("components/layout/page-title.ts")
);
check(
  "topbar uses size-9 for square icon controls",
  !/h-9 w-9|w-9 h-9/.test(topbar)
);
check(
  "topbar renders desktop header navigation",
  /<nav[\s\S]*md:flex/.test(topbar)
);

const button = file("components/ui/button.tsx");
const badge = file("components/ui/badge.tsx");
check(
  "button variants live outside component file",
  !/export \{ Button, buttonVariants \}/.test(button) &&
    button.includes('from "@/components/ui/button-variants"')
);
check(
  "badge variants live outside component file",
  !/export \{ Badge, badgeVariants \}/.test(badge) &&
    badge.includes('from "@/components/ui/badge-variants"')
);

const rootPage = file("app/page.tsx");
check(
  "root page exports metadata",
  /export const metadata/.test(rootPage) &&
    /title:/.test(rootPage) &&
    /description:/.test(rootPage)
);

const resultsNormalizedExport = file("lib/export/results-normalized.ts");
check(
  "normalized results export formats arrays in one pass",
  !/\.map\(formatResultValue\)\s*\.filter\(/.test(resultsNormalizedExport)
);

const exportRouteHelpers = file("lib/export/route-helpers.ts");
check(
  "export route error stays internal to route helpers",
  !/export\s+class\s+ExportRouteError\b/.test(exportRouteHelpers)
);

const rootLayout = file("app/layout.tsx");
check(
  "color scheme init script is imported from tracked source",
  exists("lib/theme/color-scheme-init.ts") &&
    !exists("public/color-scheme-init.js") &&
    rootLayout.includes('from "@/lib/theme/color-scheme-init"') &&
    rootLayout.includes('id="color-scheme-init"') &&
    rootLayout.includes("COLOR_SCHEME_INIT_SCRIPT") &&
    !rootLayout.includes('src="/color-scheme-init.js"')
);

const dashboardPage = file("app/dashboard/page.tsx");
check(
  "dashboard page delegates to focused component",
  dashboardPage.includes("DashboardPageContent") &&
    dashboardPage.split("\n").length <= 20
);

const formFields = file("components/dashboard/form-fields.tsx");
check(
  "dashboard form field barrel keeps one component per file",
  !/export function (TextAreaField|SelectField)\(/.test(formFields) &&
    exists("components/dashboard/text-area-field.tsx") &&
    exists("components/dashboard/select-field.tsx")
);

const resultConfigurationDialogs = file(
  "app/dashboard/result-configuration/_components/result-configuration-dialogs.tsx"
);
check(
  "result configuration dialog barrel keeps one component per file",
  !/export function Create(Metric|Template)Dialog\(/.test(
    resultConfigurationDialogs
  ) &&
    exists(
      "app/dashboard/result-configuration/_components/create-group-dialog.tsx"
    ) &&
    exists(
      "app/dashboard/result-configuration/_components/create-metric-dialog.tsx"
    ) &&
    exists(
      "app/dashboard/result-configuration/_components/create-template-dialog.tsx"
    )
);

const reactDoctorConfig = exists("doctor.config.json")
  ? jsonFile("doctor.config.json")
  : {};
const ignoredFiles = reactDoctorConfig.ignore?.files ?? [];
check(
  "react doctor ignores local secret and build artifacts",
  [".env*", ".vercel/**", ".next/**"].every((pattern) =>
    ignoredFiles.includes(pattern)
  )
);

const packageJson = jsonFile("package.json");
const reactDoctorScripts = Object.entries(packageJson.scripts ?? {}).filter(
  ([name]) => name.startsWith("react-doctor")
);
check(
  "react doctor scripts use current blocking flag",
  reactDoctorScripts.every(([, script]) => !script.includes("--fail-on"))
);

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length > 0) {
  console.error("React Doctor cleanup checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  exit(1);
}

console.log("React Doctor cleanup checks passed.");
