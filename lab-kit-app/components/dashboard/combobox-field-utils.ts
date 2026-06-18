/** Option contract for a text combobox that submits a stable record ID. */
export type ComboboxFieldOption = {
  id: string;
  label: string;
};

/** Return a matched ID only when exactly one option has the entered label. */
export function uniqueOptionIdForLabel(
  options: ComboboxFieldOption[],
  label: string
) {
  let matchedId = "";
  let matchCount = 0;

  for (const option of options) {
    if (option.label === label) {
      matchedId = option.id;
      matchCount += 1;
    }
  }

  return matchCount === 1 ? matchedId : "";
}
