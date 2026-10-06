"use client";

import { useSyncExternalStore, useState } from "react";
import { Cookie, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CONSENT_CHANGED_EVENT,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentChoice,
} from "../lib/cookie-consent";

// subscribe/snapshot สำหรับ useSyncExternalStore (อ่าน consent จาก cookie ฝั่ง client เท่านั้น)
function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
}
const getConsentSnapshot = () => readCookieConsent();
const getServerConsentSnapshot = (): CookieConsentChoice | null => null;

/**
 * CookieConsentBanner — แถบความยินยอมใช้คุกกี้ (PDPA)
 * - ยังไม่เคยเลือก → แสดงแถบให้เลือก "ยอมรับทั้งหมด" หรือ "เฉพาะที่จำเป็น"
 * - เลือกแล้ว → ซ่อนแถบ เหลือปุ่มกลมเล็กมุมซ้ายล่างไว้เปิดตั้งค่าใหม่ได้
 * - คุกกี้เซสชัน (token) เป็นคุกกี้ที่จำเป็น จึงทำงานได้โดยไม่ต้องรอ consent
 */
export function CookieConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  const decide = (choice: CookieConsentChoice) => {
    writeCookieConsent(choice); // ยิง CONSENT_CHANGED_EVENT → store อัปเดตอัตโนมัติ
    setSettingsOpen(false);
  };

  const undecided = consent === null;
  const open = undecided || settingsOpen;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="ตั้งค่าคุกกี้"
        title="ตั้งค่าคุกกี้"
        className="fixed bottom-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary shadow-md transition-colors hover:bg-muted"
      >
        <Cookie className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="การใช้คุกกี้"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Cookie className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">การใช้คุกกี้</p>
            <p className="mt-1 text-sm text-muted-foreground">
              เว็บไซต์นี้ใช้คุกกี้ที่จำเป็นเพื่อให้ระบบจดจำการเข้าสู่ระบบของคุณ
              และคุกกี้เพื่อการวิเคราะห์การใช้งานเพื่อพัฒนาบริการ
              คุณสามารถเลือกยอมรับทั้งหมด หรือใช้เฉพาะคุกกี้ที่จำเป็นก็ได้
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1 rounded-full sm:min-w-40"
            onClick={() => decide("necessary")}
          >
            เฉพาะที่จำเป็น
          </Button>
          <Button
            type="button"
            className="h-10 flex-1 rounded-full sm:min-w-40"
            onClick={() => decide("all")}
          >
            <Settings2 className="mr-1 h-4 w-4" />
            ยอมรับทั้งหมด
          </Button>
        </div>
      </div>
    </div>
  );
}
