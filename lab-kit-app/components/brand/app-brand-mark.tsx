import Image from "next/image";

import { APP_NAME, APP_SHORT_NAME } from "@/lib/branding";
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
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src={src}
        width={compact ? 128 : 180}
        height={compact ? 42 : 60}
        priority
        alt={`${APP_NAME} logo`}
        className={cn(
          "h-auto w-auto object-contain",
          compact ? "max-h-10" : "max-h-14"
        )}
      />
      <span className="sr-only">{APP_SHORT_NAME}</span>
    </div>
  );
}
