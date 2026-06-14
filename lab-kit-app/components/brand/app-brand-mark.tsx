import Image from "next/image";

import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

type AppBrandMarkProps = {
  src: string;
  compact?: boolean;
  className?: string;
};

/** Render logo và tên thương hiệu chính của ứng dụng. */
export function AppBrandMark({
  src,
  compact = false,
  className,
}: AppBrandMarkProps) {
  return (
    <div
      className={cn(
        "flex items-center text-left",
        compact ? "justify-center gap-2" : "gap-3",
        className
      )}
    >
      <Image
        src={src}
        width={compact ? 64 : 84}
        height={compact ? 64 : 84}
        priority
        alt=""
        aria-hidden="true"
        className={cn(
          "aspect-square h-auto shrink-0 object-contain",
          compact ? "max-h-14" : "max-h-[72px]"
        )}
      />
      <span
        className={cn(
          "max-w-56 text-balance font-extrabold leading-tight text-red-700",
          compact ? "text-sm" : "text-xl"
        )}
      >
        {APP_NAME}
      </span>
    </div>
  );
}
