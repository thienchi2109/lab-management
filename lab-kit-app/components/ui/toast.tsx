"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastOptions = {
  title: string;
  description?: string;
  intent?: "default" | "destructive";
};

type ToastRecord = ToastOptions & {
  id: string;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);
let toastSequence = 0;

function ToastProvider({
  swipeDirection = "right",
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return (
    <ToastPrimitive.Provider
      data-slot="toast-provider"
      swipeDirection={swipeDirection}
      {...props}
    />
  );
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-4 right-4 z-50 flex max-h-dvh w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 outline-none sm:bottom-4 sm:top-auto",
        className
      )}
      {...props}
    />
  );
}

/** Mount global toast state and render queued notifications once per app. */
function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback((options: ToastOptions) => {
    toastSequence += 1;
    const id = `toast-${toastSequence}`;

    setToasts((current) => [...current, { ...options, id }].slice(-4));
    return id;
  }, []);

  const value = React.useMemo(
    () => ({
      toast,
      dismiss,
    }),
    [dismiss, toast]
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastProvider>
        {children}
        {toasts.map((item) => (
          <Toast
            key={item.id}
            open
            onOpenChange={(open) => {
              if (!open) {
                dismiss(item.id);
              }
            }}
            className={cn(
              item.intent === "destructive" &&
                "border-destructive/40 text-destructive"
            )}
          >
            <div className="grid gap-1">
              <ToastTitle>{item.title}</ToastTitle>
              {item.description ? (
                <ToastDescription>{item.description}</ToastDescription>
              ) : null}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

/** Return the global toast dispatcher from `AppToastProvider`. */
function useToast() {
  const context = React.use(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within AppToastProvider");
  }

  return context;
}

function Toast({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root>) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      role="status"
      className={cn(
        "group pointer-events-auto relative grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg shadow-primary/10 outline-none transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
        className
      )}
      {...props}
    />
  );
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold leading-5", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm leading-5 text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      className={cn(
        "rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      <X className="size-4" aria-hidden="true" />
      <span className="sr-only">Đóng thông báo</span>
    </ToastPrimitive.Close>
  );
}

export {
  AppToastProvider,
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToast,
};
