"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      // ✅ 1. ใส่ font-sans ที่ตัวแม่ของ Toaster
      className="toaster font-sans"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "fontFamily": "var(--font-noto-sans-thai), sans-serif",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !shadow-lg !border-2 font-sans !transition-all !duration-300 !ease-out hover:scale-[1.02]",
          success: "!bg-emerald-50 !text-emerald-900 !border-emerald-500",
          error: "!bg-red-50 !text-red-900 !border-red-500",
          warning: "!bg-amber-50 !text-amber-900 !border-amber-500",
          info: "!bg-blue-50 !text-blue-900 !border-blue-500",

          description: "!text-muted-foreground text-xs mt-1 font-sans",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
