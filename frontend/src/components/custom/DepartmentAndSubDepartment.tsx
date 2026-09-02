import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

interface DepartmentAndSubDepartmentProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: boolean | string;
  className?: string;
}

export const DepartmentAndSubDepartmentComboBox = ({
  options,
  value,
  onChange,
  placeholder = "ค้นหาหรือเลือก...",
  error,
  className,
}: DepartmentAndSubDepartmentProps) => {
  const [inputValue, setInputValue] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Combobox
      value={value || null}
      onValueChange={(val) => onChange(val || "")}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <ComboboxInput
        placeholder={placeholder}
        className={cn(
          "w-full bg-surface",
          !!error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        showTrigger={true}
        showClear={!!value}
      />
      <ComboboxContent align="start" className="w-full p-0 shadow-level-2 border-border">
        <ComboboxList>
          {options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              กรุณาเลือกข้อมูลก่อนหน้า
            </div>
          ) : (
            <>
              {filteredOptions.map((option) => (
                <ComboboxItem key={option} value={option}>
                  {option}
                </ComboboxItem>
              ))}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
