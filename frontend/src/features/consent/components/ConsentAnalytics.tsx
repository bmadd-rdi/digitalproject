"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/react";

import { CONSENT_CHANGED_EVENT, readCookieConsent } from "../lib/cookie-consent";

// subscribe/snapshot สำหรับ useSyncExternalStore (ค่า consent คนละฝั่งกับ server เสมอ)
function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
}
const getConsentSnapshot = () => readCookieConsent();
const getServerConsentSnapshot = (): string | null => null;

/**
 * ConsentAnalytics — โหลด Vercel Analytics เฉพาะเมื่อผู้ใช้เลือก "ยอมรับทั้งหมด" เท่านั้น
 * ฟัง event CONSENT_CHANGED_EVENT เพื่อโหลด/หยุดตามการเปลี่ยนใจของผู้ใช้
 */
export function ConsentAnalytics() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  if (consent !== "all") return null;
  return <Analytics />;
}
