import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { SelectField } from "./form-fields";

describe("SelectField", () => {
  test("renders a shadcn selector while preserving form submission name and value", () => {
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
    expect(html).not.toContain("<select");
  });
});
