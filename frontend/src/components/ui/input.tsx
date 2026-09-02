import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean | string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          // 1. คลาสพื้นฐาน (ขนาด, ตัวหนังสือ, เลย์เอาต์) จะคงที่เสมอ
          "h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          
          // 2. แยกสีเด็ดขาด: ถ้ามี error ใช้บรรทัดบน ถ้าไม่มีใช้บรรทัดล่าง
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
Input.displayName = "Input"

export { Input }