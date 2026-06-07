import * as React from "react";
import { Slot } from "radix-ui";
import type { VariantProps } from "class-variance-authority";

import { badgeVariants } from "@/components/ui/badge-variants";
import { cn } from "@/lib/utils";

function Badge({
  asChild = false,
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge };
