import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = {
  default: "border-border bg-background text-foreground",
  warning: "border-orange-200 bg-orange-50 text-orange-950",
  destructive: "border-red-200 bg-red-50 text-red-900",
} as const;

export function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: keyof typeof alertVariants;
}) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "relative w-full rounded-md border px-4 py-3 text-sm",
        alertVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return <h5 className={cn("mb-1 font-bold leading-none", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm leading-relaxed", className)} {...props} />;
}
