import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base Styles: เปลี่ยนเป็น rounded-full (Pill-shape), เพิ่ม shadow อ่อนๆ, และใส่ active:scale-[0.98] ให้เวลากดแล้วดูนุ่มนวล
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // ปุ่มหลัก (Primary Green)
        default: 
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        
        // ตาม Design.md: White fill, 1.5px solid Ink Black border 
        secondary:
          "border-[1.5px] border-foreground bg-background text-foreground shadow-sm hover:bg-foreground hover:text-background",
        
        // ปุ่มขอบเทาปกติ
        outline:
          "border-[1.5px] border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        
        // [เพิ่มใหม่] ปุ่ม Soft: พื้นหลังจางๆ สีเดียวกับ Primary เหมาะสำหรับ Action รอง
        soft: 
          "bg-primary/10 text-primary hover:bg-primary/20",
        
        // ปุ่มไร้ขอบ ไร้พื้นหลัง
        ghost:
          "hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        
        // ปุ่มลบ/อันตราย
        destructive:
          "bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:border-destructive/40 focus-visible:ring-destructive/20 border-[1.5px] border-destructive",
        
        // ลิงก์
        link: 
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // ทรงแคปซูลต้องใช้ px (Padding แกน X) กว้างกว่าปกติ
        default:
          "h-10 gap-2 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        sm: 
          "h-8 gap-1.5 px-4 text-xs has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: 
          "h-12 gap-2 px-8 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        
        // สำหรับปุ่ม Icon ล้วน (วงกลม)
        icon: "size-10",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
        
        // [เพิ่มใหม่] Satellite CTA (56px) ตาม Design.md
        satellite: "size-14 shadow-lg [&_svg:not([class*='size-'])]:size-6", 
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }