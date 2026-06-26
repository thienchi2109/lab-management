import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Field, SelectField, TextAreaField } from "./form-fields";

describe("Field", () => {
  test("renders field-level error text and invalid state", () => {
    const html = renderToStaticMarkup(
      <Field
        label="Mã mẫu"
        name="sampleCode"
        error="Mã mẫu phải có dạng T6_00012."
      />
    );

    expect(html).toContain("Mã mẫu phải có dạng T6_00012.");
    expect(html).toContain('aria-invalid="true"');
  });

  test("uses touch-friendly input height for mobile forms", () => {
    const html = renderToStaticMarkup(<Field label="Mã nhóm" name="code" />);

    expect(html).toContain("h-11");
    expect(html).toContain("px-3");
  });
});

describe("SelectField", () => {
  test("renders a Radix selector while preserving form submission name and value", () => {
    const html = renderToStaticMarkup(
      <SelectField
        label="Trạng thái"
        name="status"
        defaultValue={false}
        options={[
          ["true", "Hoạt động"],
          ["false", "Tạm khóa"],
        ]}
      />
    );

    expect(html).toContain('name="status"');
    expect(html).toContain('value="false"');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-hidden="true"');
  });

  test("renders field-level error text for the shadcn selector", () => {
    const html = renderToStaticMarkup(
      <SelectField
        label="Trạng thái"
        name="status"
        error="Trạng thái mẫu không hợp lệ."
        options={[["received", "Đã nhận"]]}
      />
    );

    expect(html).toContain("Trạng thái mẫu không hợp lệ.");
    expect(html).toContain('aria-invalid="true"');
  });

  test("renders placeholder text when no select value is selected", () => {
    const html = renderToStaticMarkup(
      <SelectField
        label="Trạng thái"
        name="status"
        options={[["received", "Đã nhận"]]}
      />
    );

    expect(html).toContain("Chọn");
    expect(html).toContain('name="status"');
    expect(html).toContain('value=""');
  });

  test("uses touch-friendly trigger height for mobile forms", () => {
    const html = renderToStaticMarkup(
      <SelectField
        label="Trạng thái"
        name="status"
        options={[["received", "Đã nhận"]]}
      />
    );

    expect(html).toContain("h-11");
    expect(html).toContain("px-3");
  });
});

describe("TextAreaField", () => {
  test("renders field-level error text and invalid state", () => {
    const html = renderToStaticMarkup(
      <TextAreaField
        label="Ghi chú"
        name="note"
        error="Ghi chú tối đa 500 ký tự."
      />
    );

    expect(html).toContain("Ghi chú tối đa 500 ký tự.");
    expect(html).toContain('aria-invalid="true"');
  });

  test("uses touch-friendly textarea sizing for mobile forms", () => {
    const html = renderToStaticMarkup(
      <TextAreaField label="Ghi chú" name="note" />
    );

    expect(html).toContain("min-h-28");
    expect(html).toContain("px-3");
  });
});
