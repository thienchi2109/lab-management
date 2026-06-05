export type DashboardActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

type ActionMessageProps = {
  state: DashboardActionState;
};

export function ActionMessage({ state }: ActionMessageProps) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <p
      className={
        state.status === "success"
          ? "text-sm font-medium text-emerald-600"
          : "text-sm font-medium text-destructive"
      }
    >
      {state.message}
    </p>
  );
}
