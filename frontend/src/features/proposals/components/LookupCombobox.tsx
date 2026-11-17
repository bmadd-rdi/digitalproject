// src/features/proposals/components/LookupCombobox.tsx
// Same searchable dropdown used by the /register form (FormCombobox).
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

interface LookupComboboxProps {
  options: { id: number; name: string }[];
  value: number;
  onChange: (id: number) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export const LookupCombobox = ({
  options,
  value,
  onChange,
  placeholder = "ค้นหาหรือเลือก...",
  error,
  className,
  disabled = false,
}: LookupComboboxProps) => {
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayValue = selectedOption ? selectedOption.name : "";

  // Derive the selected label so drafts also display correctly when lookup
  // options arrive later. Only an active search needs separate state.
  const inputValue = searchValue ?? displayValue;

  // While the text equals the selected name, show the full list (not just the
  // one selected item); filter only while the user is typing something else.
  const query = inputValue === displayValue ? "" : inputValue.toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query),
  );

  return (
    <Combobox
      value={displayValue}
      onValueChange={(valName) => {
        const selected = options.find((opt) => opt.name === valName);
        // Ignore empty/unknown callbacks (e.g. while options are still
        // loading) so they can never wipe a restored value.
        if (!selected) return;
        setSearchValue(null);
        if (selected.id !== value) onChange(selected.id);
      }}
      inputValue={inputValue}
      onInputValueChange={setSearchValue}
      onOpenChange={(open) => {
        if (!open) setSearchValue(null);
      }}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        className={cn("w-full bg-surface", className, disabled && "opacity-50 cursor-not-allowed")}
      />
      <ComboboxContent>
        <ComboboxList>
          {filteredOptions.length === 0 ? (
            <ComboboxEmpty>ไม่พบข้อมูล</ComboboxEmpty>
          ) : (
            filteredOptions.map((option) => (
              <ComboboxItem key={option.id} value={option.name}>
                {option.name}
              </ComboboxItem>
            ))
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
