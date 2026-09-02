import "./globals.css";
import type { Metadata } from "next";
// Import ฟอนต์ Noto Sans Thai
import { Noto_Sans_Thai } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import { Providers } from "./Providers";
import { Toaster } from "@/components/ui/sonner"

// Font configuration
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"], // เลือกน้ำหนัก
  variable: "--font-noto-sans-thai", // ตั้งชื่อ CSS Variable
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบจัดการโครงการ กทม.",
  description: "...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${notoSansThai.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
