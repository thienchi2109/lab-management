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
  /function getPageTitle\(path: string\)/.test(topbar) &&
    !/export function Topbar\(\)[\s\S]*const getPageTitle/.test(topbar)
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

const dashboardPage = file("app/dashboard/page.tsx");
check(
  "dashboard page delegates to focused component",
  dashboardPage.includes("DashboardPageContent") &&
    dashboardPage.split("\n").length <= 20
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
