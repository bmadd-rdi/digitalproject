"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Loader2, MapPin, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMeeting } from "../hooks/useMeetings";
import { BOARD_LABELS } from "@/features/workflow/board-labels";

const schema = z.object({
  meetingNo: z.string().trim().min(1, "กรุณาระบุครั้งที่ประชุม").max(100),
  title: z.string().trim().min(5, "กรุณาระบุชื่อการประชุมอย่างน้อย 5 ตัวอักษร").max(500),
  meetingTypeId: z.string().min(1, "กรุณาเลือกประเภทคณะกรรมการ"),
  meetingDate: z.string().min(1, "กรุณาระบุวันและเวลา"),
  location: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
});
type Values = z.infer<typeof schema>;

export function CreateMeetingForm() {
  const router = useRouter();
  const mutation = useCreateMeeting();
  const { register, control, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      meetingNo: "",
      title: "",
      meetingTypeId: "",
      meetingDate: "",
      location: "",
      description: "",
    },
  });

  const submit = async (values: Values) => {
    try {
      await mutation.mutateAsync({
        meetingNo: values.meetingNo,
        title: values.title,
        meetingTypeId: Number(values.meetingTypeId),
        meetingDate: new Date(values.meetingDate).toISOString(),
        location: values.location?.trim() || null,
        description: values.description?.trim() || null,
      });
      toast.success("สร้างการประชุมสำเร็จ", { description: "การประชุมถูกบันทึกเป็นฉบับร่าง" });
      router.push("/meetings");
    } catch (error) {
      toast.error("ไม่สามารถสร้างการประชุมได้", {
        description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border-border/70 shadow-sm">
      <CardHeader className="border-b bg-muted/30 px-6 py-6 sm:px-8">
        <CardTitle className="text-xl font-bold">สร้างการประชุมใหม่</CardTitle>
        <p className="text-sm text-muted-foreground">
          ระบุข้อมูลพื้นฐานก่อนเพิ่มโครงการและจัดลำดับวาระการประชุม
        </p>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="ครั้งที่ประชุม" error={errors.meetingNo?.message}>
              <Input {...register("meetingNo")} placeholder="เช่น 1/2569" />
            </Field>
            <Field label="ประเภทคณะกรรมการ" error={errors.meetingTypeId?.message}>
              <Controller name="meetingTypeId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="เลือกประเภทคณะกรรมการ" /></SelectTrigger>
                  <SelectContent>
                  <SelectItem value="1">{BOARD_LABELS.SMALL_BOARD}</SelectItem>
                  <SelectItem value="2">{BOARD_LABELS.BIG_BOARD}</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </Field>
          </div>
          <Field label="ชื่อการประชุม" error={errors.title?.message}>
            <Textarea {...register("title")} rows={2} placeholder="ระบุชื่อหรือหัวข้อหลักของการประชุม" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="วันและเวลา" error={errors.meetingDate?.message} icon={<CalendarDays className="size-4" />}>
              <Input type="datetime-local" {...register("meetingDate")} />
            </Field>
            <Field label="สถานที่" error={errors.location?.message} icon={<MapPin className="size-4" />}>
              <Input {...register("location")} placeholder="ระบุห้องประชุมหรือสถานที่" />
            </Field>
          </div>
          <Field label="รายละเอียดเพิ่มเติม" error={errors.description?.message}>
            <Textarea {...register("description")} rows={4} placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" />
          </Field>
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/meetings")} disabled={mutation.isPending}>
              <X className="mr-2 size-4" />ยกเลิก
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="text-white">
              {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              {mutation.isPending ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, icon, children }: {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="flex items-center gap-2">{icon}{label}</Label>
      {children}
      {error && <p className="break-words text-xs text-destructive">{error}</p>}
    </div>
  );
}
