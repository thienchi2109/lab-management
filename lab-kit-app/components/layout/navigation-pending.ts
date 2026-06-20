"use client";

import { useState, type MouseEvent } from "react";

import { isNavItemActive } from "@/components/layout/navigation-items";

type NavigateHandler = (event: MouseEvent<HTMLAnchorElement>) => void;

type PendingNavigation = {
  href: string;
  fromPath: string;
};

/** Theo dõi lượt bấm điều hướng dashboard cho đến khi pathname cập nhật. */
export function useDashboardNavigationPending(pathname: string) {
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);

  function getItemState(href: string) {
    const isActive = isNavItemActive(pathname, href);
    const isPending =
      pendingNavigation?.href === href &&
      pendingNavigation.fromPath === pathname &&
      !isActive;

    return {
      isActive,
      isPending,
      isHighlighted: isActive || isPending,
    };
  }

  function getNavigateHandler(
    href: string,
    onNavigate?: NavigateHandler
  ): NavigateHandler {
    return (event) => {
      onNavigate?.(event);

      if (event.defaultPrevented || isNavItemActive(pathname, href)) {
        return;
      }

      setPendingNavigation({ href, fromPath: pathname });
    };
  }

  return { getItemState, getNavigateHandler };
}
