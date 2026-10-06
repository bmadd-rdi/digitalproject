import "./globals.css";
import type { Metadata } from "next";
// Import ฟอนต์ Noto Sans Thai
import { Noto_Sans_Thai } from "next/font/google";
import { Providers } from "./Providers";
import { Toaster } from "@/components/ui/sonner"
import { CookieConsentBanner } from "@/features/consent/components/CookieConsentBanner";
import { ConsentAnalytics } from "@/features/consent/components/ConsentAnalytics";

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
          <CookieConsentBanner />
        </Providers>
        <ConsentAnalytics />
      </body>
    </html>
  );
}
