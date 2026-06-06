export type FieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  error?: string;
};

export type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | boolean;
  options: Array<[string, string]>;
  error?: string;
};
