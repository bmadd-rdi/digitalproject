"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { department } from "@/data/lookup";

interface AgencyComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string; // 📍 1. เพิ่ม prop className
}

export function AgencyComboBox({ value, onChange, disabled, className }: AgencyComboBoxProps) { // 📍 2. รับค่า className เข้ามา
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal bg-surface hover:bg-surface-variant/30",
            !value && "text-muted-foreground",
            className // 📍 3. นำ className มาต่อท้ายด้วย cn() เพื่อให้มัน Overwrite ค่า default ได้
          )}
        >
          {value
            ? department.find((dept) => dept.name === value)?.name || value
            : "เลือกหน่วยงาน..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหาหน่วยงาน..." />
          <CommandList>
            <CommandEmpty>ไม่พบหน่วยงานที่ค้นหา</CommandEmpty>
            <CommandGroup>
              {department.map((dept) => (
                <CommandItem
                  key={dept.id}
                  value={dept.name}
                  onSelect={() => {
                    onChange(dept.name === value ? "" : dept.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === dept.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {dept.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}