import React, { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea"; // อ้างอิง Textarea เดิมของ shadcn

export const RichTextarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof Textarea>>(
  (props, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // ดักจับการกดปุ่ม Tab
      if (e.key === "Tab") {
        e.preventDefault(); // ป้องกันไม่ให้กระโดดไปช่องอื่น
        
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const value = target.value;

        // 1. แทรก "\t" ลงไปใน DOM โดยตรง
        target.value = value.substring(0, start) + "\t" + value.substring(end);
        
        // 2. ขยับ Cursor ไปไว้หลัง Tab ที่เพิ่งแทรก
        target.selectionStart = target.selectionEnd = start + 1;

        // 3. จำลอง Event เพื่อให้ react-hook-form รู้ว่ามีการเปลี่ยนค่าเกิดขึ้น
        const event = new Event("input", { bubbles: true });
        target.dispatchEvent(event);
      }

      // ถ้ามีการส่ง onKeyDown อื่นๆ เข้ามาด้วย ให้ทำงานตามปกติ
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <Textarea
        {...props}
        ref={ref}
        onKeyDown={handleKeyDown}
        // แนะนำให้ใส่ whitespace-pre-wrap เพื่อให้เบราว์เซอร์แสดงผล Tab ได้ถูกต้อง
        className={`whitespace-pre-wrap text-sm ${props.className || ""}`}
      />
    );
  }
);

RichTextarea.displayName = "RichTextarea";