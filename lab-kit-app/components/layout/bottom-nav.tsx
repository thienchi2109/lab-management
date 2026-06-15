"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import {
  isNavItemActive,
  mobileNavItems,
} from "@/components/layout/navigation-items";
import { cn } from "@/lib/utils";

const primaryMobileTitles = new Set(["Mẫu", "Báo cáo", "Kho KIT"]);

/** Render bottom navigation mobile với 3 tab chính và menu Thêm. */
export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const primaryItems = mobileNavItems.filter((item) =>
    primaryMobileTitles.has(item.title)
  );
  const moreItems = mobileNavItems.filter(
    (item) => !primaryMobileTitles.has(item.title)
  );
  const isMoreActive = moreItems.some((item) =>
    isNavItemActive(pathname, item.url)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border/50 bg-background/90 pb-safe backdrop-blur-md md:hidden">
      {isMoreOpen ? (
        <div className="mx-3 mb-2 rounded-xl border border-border/70 bg-popover p-2 text-popover-foreground shadow-lg">
          <div className="grid grid-cols-2 gap-1">
            {moreItems.map((item) => {
              const isActive = isNavItemActive(pathname, item.url);

              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => setIsMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    isActive && "bg-accent text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
      <nav className="grid h-[4.5rem] grid-cols-4 items-center px-2">
        {primaryItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.url);

          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
                isActive && "text-primary"
              )}
            >
              <div className="relative flex items-center justify-center py-1">
                <item.icon className="size-6" />
                {isActive && (
                  <span className="absolute -bottom-0.5 size-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[11px] font-medium leading-none tracking-tight">
                {item.title}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={isMoreOpen}
          aria-label="Mở menu thêm"
          onClick={() => setIsMoreOpen((current) => !current)}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
            isMoreActive && "text-primary"
          )}
        >
          <div className="relative flex items-center justify-center py-1">
            <MoreHorizontal className="size-6" />
            {isMoreActive && (
              <span className="absolute -bottom-0.5 size-1 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[11px] font-medium leading-none tracking-tight">
            Thêm
          </span>
        </button>
      </nav>
    </div>
  );
}
