import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

describe("Radix UI primitive contracts", () => {
  test("Button composes styles onto a child element with asChild", () => {
    const html = renderToStaticMarkup(
      <Button asChild>
        <a href="/dashboard/samples">Nhập kết quả mới</a>
      </Button>
    );

    expect(html).toContain("<a");
    expect(html).toContain('href="/dashboard/samples"');
    expect(html).toContain("Nhập kết quả mới");
    expect(html).not.toContain("<button");
  });

  test("Badge composes styles onto a child element with asChild", () => {
    const html = renderToStaticMarkup(
      <Badge asChild variant="secondary">
        <a href="/dashboard/users">Quản trị</a>
      </Badge>
    );

    expect(html).toContain("<a");
    expect(html).toContain('href="/dashboard/users"');
    expect(html).toContain("Quản trị");
    expect(html).not.toContain("<span");
  });

  test("Input renders a native input with the shared data slot", () => {
    const html = renderToStaticMarkup(
      <Input name="sampleCode" defaultValue="T6_00012" />
    );

    expect(html).toContain("<input");
    expect(html).toContain('data-slot="input"');
    expect(html).toContain('name="sampleCode"');
    expect(html).toContain('value="T6_00012"');
  });

  test("Checkbox renders the shared Radix checkbox control", () => {
    const html = renderToStaticMarkup(
      <Checkbox name="enabled" value="true" defaultChecked />
    );

    expect(html).toContain('role="checkbox"');
    expect(html).toContain('data-slot="checkbox"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('name="enabled"');
  });
});
