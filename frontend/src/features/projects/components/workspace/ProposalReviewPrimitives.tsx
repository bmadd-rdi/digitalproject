"use client";

import { useState, type ReactNode } from "react";
import { Check, Clipboard, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { displayValue, type ProposalRow } from "./proposal-view.utils";

export function CopyValueButton({ value, label }: { value: string; label: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`คัดลอก${label}แล้ว`);
    } catch {
      toast.error(`ไม่สามารถคัดลอก${label}ได้`);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="shrink-0 opacity-70 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
      aria-label={`คัดลอก${label}`}
      title={`คัดลอก${label}`}
      onClick={copy}
    >
      <Clipboard className="h-3.5 w-3.5" />
    </Button>
  );
}

export function ProposalField({
  label,
  value,
  render,
  copyable = false,
  className,
}: {
  label: string;
  value: unknown;
  render?: () => ReactNode;
  copyable?: boolean;
  className?: string;
}) {
  const shown = displayValue(value);
  return (
    <div className={cn("group min-w-0 rounded-xl p-3 transition-colors hover:bg-muted/50", className)}>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex min-w-0 items-start gap-2">
        <p className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-sm font-semibold text-foreground">
          {render ? render() : shown}
        </p>
        {copyable && value !== null && value !== undefined && value !== "" && (
          <CopyValueButton value={String(value)} label={label} />
        )}
      </div>
    </div>
  );
}

export function ProposalLongText({
  label,
  value,
  className,
}: {
  label: string;
  value: unknown;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = displayValue(value);
  const hasText = shown !== "-";

  return (
    <div className={cn("group min-w-0 rounded-xl p-3 transition-colors hover:bg-muted/50", className)}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {hasText && <CopyValueButton value={shown} label={label} />}
      </div>
      <p className={cn("whitespace-pre-wrap break-words text-sm leading-6 text-foreground", !expanded && hasText && "line-clamp-4")}>
        {shown}
      </p>
      {hasText && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 h-7 px-2 text-xs text-primary"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <ChevronDown className="mr-1 h-3.5 w-3.5" />}
          {expanded ? "ย่อข้อความ" : "อ่านเพิ่มเติม"}
        </Button>
      )}
    </div>
  );
}

export function ProposalStepSection({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string;
  number: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="min-w-0 scroll-mt-6">
      <Card className="min-w-0 overflow-visible rounded-2xl border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5 h-7 min-w-7 justify-center rounded-full">{number}</Badge>
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-4 sm:p-6">{children}</CardContent>
      </Card>
    </section>
  );
}

export function ReviewSubsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-3">
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      <Separator />
      {children}
    </div>
  );
}

export function ProposalArrayTable({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: ProposalRow[];
  columns: Array<{ key: string; label: string; render?: (row: ProposalRow) => ReactNode }>;
}) {
  return (
    <ReviewSubsection title={title}>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          ไม่มีข้อมูล
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="min-w-max text-left text-sm sm:min-w-full">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                {columns.map((column) => <th key={column.key} className="whitespace-nowrap px-3 py-2.5 font-semibold">{column.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, index) => (
                <tr key={String(row.id ?? index)} className="transition-colors hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={column.key} className="max-w-[20rem] whitespace-nowrap px-3 py-2.5 align-top text-foreground sm:max-w-none">
                      {column.render ? column.render(row) : displayValue(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReviewSubsection>
  );
}

export function BooleanStatus({ value }: { value: unknown }) {
  const enabled = value === true;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Check className={cn("h-4 w-4", enabled ? "text-emerald-600" : "text-muted-foreground")} />
      {enabled ? "ใช่" : "ไม่ใช่"}
    </span>
  );
}
