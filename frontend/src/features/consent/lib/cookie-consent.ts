// src/features/consent/lib/cookie-consent.ts
// ตัวช่วยอ่าน/เขียน cookie ความยินยอมใช้คุกกี้ (consent cookie)
// Consent cookie เป็นฝั่ง client เท่านั้น ใช้ document.cookie — ห้ามใส่ secret ลงนี้

export const COOKIE_CONSENT_NAME = "bma_cookie_consent";

/** "all" = ยอมรับทั้งหมด, "necessary" = เฉพาะคุกกี้ที่จำเป็นเท่านั้น */
export type CookieConsentChoice = "all" | "necessary";

/** อายุ consent cookie 180 วัน (ตามแนวทาง PDPA ทั่วไป ไม่เกิน 1 ปี) */
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

/** Event ที่ยิงเมื่อผู้ใช้เปลี่ยนใจเรื่อง consent ให้ component อื่นฟังตาม */
export const CONSENT_CHANGED_EVENT = "bma:consent-changed";

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof document === "undefined") return null;

  const row = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_NAME}=`));
  if (!row) return null;

  const value = decodeURIComponent(row.slice(COOKIE_CONSENT_NAME.length + 1));
  return value === "all" || value === "necessary" ? value : null;
}

export function writeCookieConsent(choice: CookieConsentChoice): void {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${COOKIE_CONSENT_NAME}=${encodeURIComponent(choice)}` +
    `; path=/; max-age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}
