type FieldErrorProps = {
  id: string;
  message?: string;
};

/** Render thông báo lỗi ngắn cho field trong biểu mẫu dashboard. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}
