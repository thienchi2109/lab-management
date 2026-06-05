import { AppSelect } from "./app-select";

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
};

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <AppSelect
      label={label}
      value={value}
      onValueChange={onChange}
      options={options.map(([optionValue, optionLabel]) => ({
        value: optionValue,
        label: optionLabel,
      }))}
      size="sm"
      className="h-9 min-w-40 flex-row items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1"
      labelClassName="text-xs text-muted-foreground"
      triggerClassName="h-7 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
    />
  );
}
