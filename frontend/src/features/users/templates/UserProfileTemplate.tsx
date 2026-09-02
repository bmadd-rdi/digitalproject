"use client";

import { memo } from "react";
import {
  Building2,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Fingerprint,
  History,
  Mail,
  Phone,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserProfile } from "../hooks/useUserProfile";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string | number | null | undefined;
  isVerified?: boolean;
  copyable?: boolean;
}

const InfoRow = memo(function InfoRow({ icon: Icon, label, value, isVerified = false, copyable = false }: InfoRowProps) {
  const displayValue = value || "-";

  const copyValue = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`คัดลอก${label}แล้ว`);
    } catch {
      toast.error("ไม่สามารถคัดลอกข้อมูลได้");
    }
  };

  return (
    <div className="group flex min-w-0 items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="mt-0.5 flex min-w-0 items-start gap-2">
          <span
            title={String(displayValue)}
            className={cn(
              "min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-base font-semibold text-foreground",
              copyable && "font-mono text-sm",
            )}
          >
            {displayValue}
          </span>
          {isVerified && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" aria-label="ยืนยันแล้ว" />}
          {copyable && value && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`คัดลอก${label}`}
              title={`คัดลอก${label}`}
              className="shrink-0 opacity-70 transition-opacity hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={copyValue}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Skeleton className="h-[30rem] rounded-3xl lg:col-span-4" />
        <div className="space-y-6 lg:col-span-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function UserProfileTemplate({ currentUserId }: { currentUserId: string }) {
  const { data, isLoading, isError, refetch, isFetching } = useUserProfile(currentUserId);

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !data) {
    return (
      <div className="container mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <ShieldCheck className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้</h2>
        <p className="mt-2 text-sm text-muted-foreground">กรุณาลองใหม่อีกครั้ง หากยังพบปัญหาโปรดติดต่อผู้ดูแลระบบ</p>
        <Button className="mt-6 gap-2" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          {isFetching ? "กำลังลองใหม่..." : "ลองใหม่อีกครั้ง"}
        </Button>
      </div>
    );
  }

  const displayDivision = data.division
    ? `${data.division.divisionName} (${data.division.departmentName})`
    : "-";
  const displayRoles = data.roles?.map((role) => role.roleName) ?? [];
  const initials = `${data.firstName?.charAt(0) ?? ""}${data.lastName?.charAt(0) ?? ""}`;

  return (
    <main className="container mx-auto max-w-full px-4 py-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-sm font-semibold text-primary">สรุปข้อมูลบัญชี</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">โปรไฟล์ส่วนตัว</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">ดูข้อมูลบัญชี ข้อมูลติดต่อ หน่วยงาน และสิทธิ์การใช้งานของคุณ</p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
          <History className="h-3.5 w-3.5 shrink-0" />
          อัปเดตล่าสุด {data.updatedAt ? new Date(data.updatedAt).toLocaleString("th-TH") : "-"}
        </p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-12 lg:gap-8">
        <section className="min-w-0 lg:col-span-4">
          <div className="relative overflow-hidden rounded-md border bg-card p-5 text-center shadow-xl sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24" />
            <Avatar className="relative mx-auto mb-5 h-28 w-28 border-4 border-background shadow-xl sm:mb-6 sm:h-32 sm:w-32">
              <AvatarImage src="" alt={`${data.firstName} ${data.lastName}`} />
              <AvatarFallback className="bg-primary text-3xl text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="break-words text-2xl font-bold">{data.firstName} {data.lastName}</h2>
            <p className="mb-4 mt-1 break-words text-sm font-medium text-muted-foreground">{data.position || "-"}</p>

            <div className="mb-6 flex flex-wrap justify-center gap-2 sm:mb-8">
              <Badge variant={data.isActive ? "default" : "destructive"} className="rounded-md">
                {data.isActive ? "ใช้งานอยู่" : "ระงับการใช้งาน"}
              </Badge>
              {displayRoles.map((role) => (
                <Badge key={role} variant="secondary" className="max-w-full rounded-md font-mono text-[10px]">
                  <span className="break-words [overflow-wrap:anywhere]">{role}</span>
                </Badge>
              ))}
            </div>

            <Separator className="mb-6" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button asChild className="h-11 w-full rounded-xl"><Link href="/profile/edit"><span className="text-white">แก้ไขข้อมูลส่วนตัว</span></Link></Button>
              <Button variant="outline" className="h-11 w-full rounded-xl">เปลี่ยนรหัสผ่าน</Button>
            </div>

            <div className="mt-7 border-t pt-5">
              <p className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-tight text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" />
                เข้าใช้งานล่าสุด: {data.lastLogin ? new Date(data.lastLogin).toLocaleString("th-TH") : "ยังไม่มีข้อมูล"}
              </p>
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-6 lg:col-span-8">
          <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <div className="min-w-0 rounded-md border bg-card p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-primary"><Mail className="h-4 w-4" /> ข้อมูลการติดต่อ</h3>
              <div className="space-y-1">
                <InfoRow icon={Mail} label="อีเมลหน่วยงาน" value={data.email} isVerified={data.isVerified} />
                <InfoRow icon={Smartphone} label="โทรศัพท์มือถือ" value={data.mobilePhone} />
                <InfoRow icon={Phone} label="โทรศัพท์สำนักงาน" value={data.officePhone} />
                <InfoRow icon={PhoneCall} label="หมายเลขภายใน" value={data.internalExtension} />
              </div>
            </div>

            <div className="min-w-0 rounded-md border bg-card p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-primary"><Building2 className="h-4 w-4" /> ข้อมูลหน่วยงาน</h3>
              <div className="space-y-1">
                <InfoRow icon={Building2} label="ฝ่าย / หน่วยงาน" value={displayDivision} />
                <InfoRow icon={Briefcase} label="ตำแหน่งงาน" value={data.position} />
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-md border bg-card p-5 shadow-sm sm:p-8">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-primary"><ShieldCheck className="h-4 w-4" /> ข้อมูลบัญชีผู้ใช้</h3>
            <div className="grid min-w-0 gap-1 sm:grid-cols-2 sm:gap-x-6">
              <InfoRow icon={User} label="ชื่อผู้ใช้" value={data.username} />
              <InfoRow icon={Fingerprint} label="รหัสผู้ใช้" value={data.userId} copyable />
              <InfoRow
                icon={CalendarDays}
                label="วันที่สร้างบัญชี"
                value={data.createdAt ? new Date(data.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"}
              />
              <InfoRow icon={ShieldCheck} label="สิทธิ์การใช้งาน" value={displayRoles.join(", ")} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
