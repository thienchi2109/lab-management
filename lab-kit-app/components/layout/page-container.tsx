import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = ComponentPropsWithoutRef<"div">;

/** Constrain dashboard page content to the shared readable app width. */
export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto flex w-full max-w-7xl flex-col", className)}
      {...props}
    />
  );
}
