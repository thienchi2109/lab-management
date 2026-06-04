# React Doctor Warnings Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the 10 current React Doctor warnings in `lab-kit-app` without weakening the React Doctor gate.

**Architecture:** Treat React Doctor diagnostics as hypotheses, then lock each warning family with a small static regression test before editing source. Dashboard navigation must not render a sidebar: desktop uses the header navigation and mobile uses the bottom navigation. Keep the shadcn-style UI component API stable, split only the non-component variant exports, and split the dashboard page into focused local components without changing visible copy or routes.

**Tech Stack:** Next.js App Router 16, React 19.2, Bun scripts, npm-executed React Doctor, TypeScript, Tailwind CSS, shadcn/ui-style components.

---

## Warning Inventory

Run from `lab-kit-app/`:

```bash
npm exec --yes --package react-doctor@latest -- react-doctor . --verbose --no-telemetry --fail-on error
```

Current warnings:

- `components/ui/sidebar.tsx:48` - `react-doctor/no-react19-deprecated-apis`: remove sidebar source from the dashboard shell instead of migrating the unused component.
- `components/ui/sidebar.tsx:284` - `react-doctor/button-has-type`: remove sidebar source from the dashboard shell instead of patching the unused rail button.
- `components/layout/topbar.tsx:15` - `react-doctor/prefer-module-scope-pure-function`: move `getPageTitle` to module scope.
- `components/layout/topbar.tsx:30`, `:52`, `:63` - `react-doctor/design-no-redundant-size-axes`: replace matching `h-9 w-9` pairs with `size-9`.
- `components/ui/button.tsx:58` - `react-doctor/only-export-components`: move `buttonVariants` out of the component file.
- `components/ui/badge.tsx:52` - `react-doctor/only-export-components`: move `badgeVariants` out of the component file.
- `app/page.tsx:1` - `react-doctor/nextjs-missing-metadata`: add page metadata.
- `app/dashboard/page.tsx:22` - `react-doctor/no-giant-component`: split dashboard page sections into smaller components.

Do not run React Doctor through `bunx` or `bun x`; use package scripts or explicit `npm exec`.

## File Structure

- Create `lab-kit-app/scripts/verify-react-doctor-cleanup.mjs`: focused static regression checks for the exact warning families.
- Modify `lab-kit-app/package.json`: add `test:react-doctor-cleanup` script.
- Delete `lab-kit-app/components/ui/sidebar.tsx`: sidebar primitive is not part of the approved dashboard shell.
- Delete `lab-kit-app/components/layout/sidebar.tsx`: app sidebar is not part of the approved dashboard shell.
- Modify `lab-kit-app/app/dashboard/layout.tsx`: remove `SidebarProvider`, `SidebarInset`, and `AppSidebar`.
- Modify `lab-kit-app/components/layout/topbar.tsx`: remove `SidebarTrigger`, add desktop header navigation, module-scope title mapper, and `size-9` class cleanup.
- Create `lab-kit-app/components/ui/button-variants.ts`: export `buttonVariants`.
- Modify `lab-kit-app/components/ui/button.tsx`: import `buttonVariants`, export only `Button`.
- Create `lab-kit-app/components/ui/badge-variants.ts`: export `badgeVariants`.
- Modify `lab-kit-app/components/ui/badge.tsx`: import `badgeVariants`, export only `Badge`.
- Modify `lab-kit-app/app/page.tsx`: add `metadata`.
- Create `lab-kit-app/app/dashboard/_components/dashboard-page-content.tsx`: compose dashboard sections.
- Create `lab-kit-app/app/dashboard/_components/dashboard-hero.tsx`: welcome banner/actions.
- Create `lab-kit-app/app/dashboard/_components/dashboard-stat-card.tsx`: reusable stat card.
- Create `lab-kit-app/app/dashboard/_components/dashboard-stats-grid.tsx`: four summary cards.
- Create `lab-kit-app/app/dashboard/_components/dashboard-main-grid.tsx`: recent samples and kit status sections.
- Create `lab-kit-app/app/dashboard/_components/dashboard-metric-card.tsx`: PCR metric card.
- Modify `lab-kit-app/app/dashboard/page.tsx`: render `<DashboardPageContent />`.

## Chunk 1: Static Regression Harness

### Task 1: Add cleanup verification script

**Files:**
- Create: `lab-kit-app/scripts/verify-react-doctor-cleanup.mjs`
- Modify: `lab-kit-app/package.json`

- [ ] **Step 1: Write the failing test**

Create `lab-kit-app/scripts/verify-react-doctor-cleanup.mjs` with checks for all current warning families. Start with this skeleton and keep adding assertions in later tasks:

```js
#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd, exit } from "node:process";

const root = cwd();
const checks = [];

function file(path) {
  return readFileSync(join(root, path), "utf8");
}

function check(name, passed) {
  checks.push([name, Boolean(passed)]);
}

check("dashboard layout does not render sidebar shell", !file("app/dashboard/layout.tsx").includes("Sidebar") && !file("app/dashboard/layout.tsx").includes("AppSidebar"));
check("sidebar source files are removed", !exists("components/ui/sidebar.tsx") && !exists("components/layout/sidebar.tsx"));
check("topbar does not import sidebar trigger", !file("components/layout/topbar.tsx").includes("SidebarTrigger"));

const topbar = file("components/layout/topbar.tsx");
check("topbar title mapper is module scoped", /function getPageTitle\(path: string\)/.test(topbar) && !/export function Topbar\(\)[\s\S]*const getPageTitle/.test(topbar));
check("topbar uses size-9 for square icon controls", !/h-9 w-9|w-9 h-9/.test(topbar));

const button = file("components/ui/button.tsx");
const badge = file("components/ui/badge.tsx");
check("button variants live outside component file", !/export \{ Button, buttonVariants \}/.test(button) && button.includes('from "@/components/ui/button-variants"'));
check("badge variants live outside component file", !/export \{ Badge, badgeVariants \}/.test(badge) && badge.includes('from "@/components/ui/badge-variants"'));

const rootPage = file("app/page.tsx");
check("root page exports metadata", /export const metadata/.test(rootPage) && /title:/.test(rootPage) && /description:/.test(rootPage));

const dashboardPage = file("app/dashboard/page.tsx");
check("dashboard page delegates to focused component", dashboardPage.includes("DashboardPageContent") && dashboardPage.split("\\n").length <= 20);

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failures.length > 0) {
  console.error("React Doctor cleanup checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  exit(1);
}
console.log("React Doctor cleanup checks passed.");
```

Add script:

```json
"test:react-doctor-cleanup": "node scripts/verify-react-doctor-cleanup.mjs"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: FAIL listing the current warning families.

## Chunk 2: Focused Warning Fixes

### Task 2: Remove sidebar from dashboard shell

**Files:**
- Delete: `lab-kit-app/components/ui/sidebar.tsx`
- Delete: `lab-kit-app/components/layout/sidebar.tsx`
- Modify: `lab-kit-app/app/dashboard/layout.tsx`
- Modify: `lab-kit-app/components/layout/topbar.tsx`
- Test: `lab-kit-app/scripts/verify-react-doctor-cleanup.mjs`

- [ ] **Step 1: Confirm red for sidebar shell checks**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: sidebar shell, sidebar source, and sidebar trigger checks fail.

- [ ] **Step 2: Implement minimal sidebar removal**

Change `app/dashboard/layout.tsx` to render only the header, content, and bottom navigation:

```tsx
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col pb-16 md:pb-0">
      <Topbar />
      <main className="flex-1 overflow-auto bg-zinc-50/50 p-4 md:p-6 dark:bg-zinc-950/20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

Remove `SidebarTrigger` from `Topbar`, replace it with desktop header navigation links, and delete the sidebar source files once there are no imports.

- [ ] **Step 3: Verify green for sidebar removal**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: sidebar checks no longer appear in the failure list.

### Task 3: Fix topbar warnings

**Files:**
- Modify: `lab-kit-app/components/layout/topbar.tsx`
- Test: `lab-kit-app/scripts/verify-react-doctor-cleanup.mjs`

- [ ] **Step 1: Confirm red for topbar checks**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: topbar module-scope and `size-9` checks fail.

- [ ] **Step 2: Implement minimal topbar fix**

Move the title mapper above `Topbar`:

```ts
function getPageTitle(path: string) {
  if (path.startsWith("/dashboard/samples")) return "Quản lý mẫu xét nghiệm";
  if (path.startsWith("/dashboard/kits")) return "Quản lý lô KIT & Tồn kho";
  if (path.startsWith("/dashboard/analytics")) return "Báo cáo thống kê & Pivot";
  if (path.startsWith("/dashboard/result-config")) return "Cấu hình chỉ tiêu động";
  if (path.startsWith("/dashboard/settings")) return "Cài đặt hệ thống";
  return "Tổng quan hệ thống";
}
```

Replace the three matching square classes:

```tsx
className="hidden md:inline-flex size-9 border border-border/50"
className="relative size-9 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
className="size-9 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
```

- [ ] **Step 3: Verify green for topbar**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: topbar checks no longer appear in the failure list.

### Task 4: Split non-component variant exports

**Files:**
- Create: `lab-kit-app/components/ui/button-variants.ts`
- Modify: `lab-kit-app/components/ui/button.tsx`
- Create: `lab-kit-app/components/ui/badge-variants.ts`
- Modify: `lab-kit-app/components/ui/badge.tsx`
- Test: `lab-kit-app/scripts/verify-react-doctor-cleanup.mjs`

- [ ] **Step 1: Confirm red for variant export checks**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: button and badge variant checks fail.

- [ ] **Step 2: Implement minimal variant split**

Move `buttonVariants` to `components/ui/button-variants.ts`:

```ts
import { cva } from "class-variance-authority";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
      destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
      outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
      secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export { buttonVariants };
```

Move `badgeVariants` to `components/ui/badge-variants.ts` with the same cva body currently in `badge.tsx`.

Update component files to import variants from the new files and export only components:

```ts
export { Button };
export { Badge };
```

- [ ] **Step 3: Verify green for variant split**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
cd lab-kit-app && bun run typecheck
```

Expected: variant checks no longer fail; typecheck passes.

### Task 5: Add root page metadata

**Files:**
- Modify: `lab-kit-app/app/page.tsx`
- Test: `lab-kit-app/scripts/verify-react-doctor-cleanup.mjs`

- [ ] **Step 1: Confirm red for metadata check**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: metadata check fails.

- [ ] **Step 2: Implement minimal metadata**

Add before the page component:

```ts
export const metadata = {
  title: "Lab Kit Management",
  description: "Laboratory kit, sample, and result management dashboard.",
};
```

- [ ] **Step 3: Verify green for metadata**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
cd lab-kit-app && bun run build
```

Expected: metadata check no longer fails; build passes.

## Chunk 3: Dashboard Split

### Task 6: Split dashboard page into focused components

**Files:**
- Create: `lab-kit-app/app/dashboard/_components/dashboard-page-content.tsx`
- Create: `lab-kit-app/app/dashboard/_components/dashboard-hero.tsx`
- Create: `lab-kit-app/app/dashboard/_components/dashboard-stat-card.tsx`
- Create: `lab-kit-app/app/dashboard/_components/dashboard-stats-grid.tsx`
- Create: `lab-kit-app/app/dashboard/_components/dashboard-main-grid.tsx`
- Create: `lab-kit-app/app/dashboard/_components/dashboard-metric-card.tsx`
- Modify: `lab-kit-app/app/dashboard/page.tsx`
- Test: `lab-kit-app/scripts/verify-react-doctor-cleanup.mjs`

- [ ] **Step 1: Confirm red for dashboard split**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: dashboard page delegation check fails.

- [ ] **Step 2: Implement minimal component extraction**

Keep `page.tsx` small:

```tsx
import { DashboardPageContent } from "./_components/dashboard-page-content";

export default function DashboardPage() {
  return <DashboardPageContent />;
}
```

Move existing JSX into focused components without changing text, links, class names, or visual ordering. Use local arrays only when they reduce duplication in repeated stat/metric cards.

- [ ] **Step 3: Verify green for dashboard split**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
cd lab-kit-app && bun run typecheck
```

Expected: dashboard check passes; typecheck passes.

## Chunk 4: React Doctor and Quality Gate Verification

### Task 7: Prove all 10 warnings are cleared

**Files:**
- Verify only unless formatting changes are needed.

- [ ] **Step 1: Run the cleanup regression test**

Run:

```bash
cd lab-kit-app && bun run test:react-doctor-cleanup
```

Expected: `React Doctor cleanup checks passed.`

- [ ] **Step 2: Run React Doctor through the package script**

Run:

```bash
cd lab-kit-app && bun run react-doctor:verbose
```

Expected: no React Doctor issues. Do not use `bunx`.

- [ ] **Step 3: Run full quality gate**

Run:

```bash
cd lab-kit-app && bun run quality
```

Expected: typecheck, lint, format, React Doctor, and build all pass.

- [ ] **Step 4: Check line limits**

Run:

```bash
find lab-kit-app/app lab-kit-app/components lab-kit-app/scripts -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.mjs" \) -not -path "*/node_modules/*" -exec wc -l {} + | sort -nr | head -20
```

Expected: no created or modified code file exceeds 350 lines.

- [ ] **Step 5: Record Harness trace**

Run:

```bash
scripts/bin/harness-cli trace --summary "Cleared React Doctor warning backlog with TDD regression checks and verified the quality gate." --outcome completed
```

Expected: trace recorded.

## Commit Plan

- Commit 1: `test: add react doctor cleanup regression checks`
- Commit 2: `fix: clear sidebar and topbar react doctor warnings`
- Commit 3: `refactor: split ui variant exports`
- Commit 4: `fix: add root page metadata`
- Commit 5: `refactor: split dashboard page sections`
- Commit 6: `chore: verify react doctor warning cleanup`

## Risk Notes

- Sidebar warnings should be resolved by removing sidebar source from the dashboard shell, not by patching unused sidebar internals. The approved navigation contract is desktop header navigation plus mobile bottom navigation.
- The dashboard split must preserve visible Vietnamese copy and route links exactly; this is a refactor, not a UX rewrite.
- React Doctor's own output suggests `curl`, but repo context rules forbid direct `curl`/`wget`; use the local CLI output and source inspection instead.
