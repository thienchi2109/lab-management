export type FieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
};

export type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | boolean;
  options: Array<[string, string]>;
};
