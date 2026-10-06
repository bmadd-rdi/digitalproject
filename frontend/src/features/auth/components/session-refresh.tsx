"use client";

import { useEffect } from "react";

import { ensureFreshSessionAction } from "../actions/auth.actions";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // ทุก 10 นาที

/**
 * SessionRefresh — ต่ออายุเซสชัน (sliding session) ระหว่างที่ผู้ใช้ยังใช้งานอยู่
 * เพื่อไม่ให้ต้อง login ซ้ำระหว่างวัน โดย cookie ยังเป็น session cookie
 * (ปิดเบราว์เซอร์ = ต้อง login ใหม่ตามเดิม)
 * ทำงานคู่กับ ensureFreshSessionAction ที่จะยิง backend เฉพาะตอนใกล้หมดอายุ
 */
export function SessionRefresh() {
  useEffect(() => {
    const tick = () => {
      void ensureFreshSessionAction().catch(() => {
        // ปล่อยเงียบ — ถ้า refresh ไม่ได้ ระบบจะพาไปหน้า login เมื่อ token หมดอายุจริง
      });
    };

    tick();
    const intervalId = window.setInterval(tick, REFRESH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
