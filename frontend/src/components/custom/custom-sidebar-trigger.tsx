// src/components/custom/custom-sidebar-trigger.tsx
"use client"; // ต้องมีเพราะมีการใช้ onClick และ Hook

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="text-muted-foreground hover:text-primary hover:bg-surface-variant"
      aria-label="เปิด/ปิด แถบเมนู"
    >
      <Menu className="h-6 w-6" /> {/* Custom Icon */}
    </Button>
  );
}