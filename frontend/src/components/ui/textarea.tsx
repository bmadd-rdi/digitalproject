import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: boolean | string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        data-slot="textarea"
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          // 1. คลาสพื้นฐาน
          "flex field-sizing-content min-h-16 w-full rounded-md border px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          
          // 2. แยกสีเด็ดขาด
          error
            ? "border-status-orange bg-orange-50/30 focus-visible:border-status-orange focus-visible:ring-3 focus-visible:ring-status-orange/50"
            : "border-input bg-transparent dark:bg-input/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }