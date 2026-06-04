"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isNavItemActive,
  mobileNavItems,
} from "@/components/layout/navigation-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border/50 bg-background/90 pb-safe backdrop-blur-md md:hidden">
      <nav className="flex h-16 items-center justify-around px-2">
        {mobileNavItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.url);

          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-foreground",
                isActive && "text-primary"
              )}
            >
              <div className="relative flex items-center justify-center py-1">
                <item.icon className="size-5" />
                {isActive && (
                  <span className="absolute -bottom-0.5 size-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] font-medium leading-none tracking-tight">
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
