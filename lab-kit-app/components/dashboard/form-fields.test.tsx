import { isValidElement } from "react";
import { describe, expect, test } from "vitest";

import { SelectField } from "./form-fields";

describe("SelectField", () => {
  test("uses an empty default value when no default is provided", () => {
    const field = SelectField({
      label: "Trạng thái",
      name: "status",
      options: [["", "Chọn trạng thái"]],
    });

    expect(isValidElement(field)).toBe(true);
    const [, select] = field.props.children;

    expect(select.props.defaultValue).toBe("");
  });
});
