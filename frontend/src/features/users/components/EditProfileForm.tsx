"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Briefcase, CalendarDays, Mail, Save, ShieldCheck, Smartphone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUserProfile } from "../hooks/useUserProfile";
import { updateOwnProfileAction } from "../actions/user.actions";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "กรุณาระบุชื่อ").max(100),
  lastName: z.string().trim().min(1, "กรุณาระบุนามสกุล").max(100),
  mobilePhone: z.string().trim().min(6, "กรุณาระบุหมายเลขโทรศัพท์มือถือให้ถูกต้อง").max(20).or(z.literal("")),
  officePhone: z.string().trim().min(6, "กรุณาระบุหมายเลขโทรศัพท์สำนักงานให้ถูกต้อง").max(20).or(z.literal("")),
  internalExtension: z.string().trim().min(1, "กรุณาระบุหมายเลขภายใน").max(10).or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Field = ({ label, name, register, error }: {
  label: string;
  name: keyof ProfileFormValues;
  register: ReturnType<typeof useForm<ProfileFormValues>>["register"];
  error?: string;
}) => (
  <label className="space-y-1.5 text-sm font-medium">
    <span>{label}</span>
    <Input {...register(name)} />
    {error && <span className="text-xs text-destructive">{error}</span>}
  </label>
);

export function EditProfileForm({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const profileQuery = useUserProfile(userId);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", mobilePhone: "", officePhone: "", internalExtension: "" },
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    form.reset({
      firstName: profileQuery.data.firstName,
      lastName: profileQuery.data.lastName,
      mobilePhone: profileQuery.data.mobilePhone ?? "",
      officePhone: profileQuery.data.officePhone ?? "",
      internalExtension: profileQuery.data.internalExtension ?? "",
    });
  }, [form, profileQuery.data]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) => updateOwnProfileAction({
      firstName: values.firstName,
      lastName: values.lastName,
      mobilePhone: values.mobilePhone || null,
      officePhone: values.officePhone || null,
      internalExtension: values.internalExtension || null,
    }),
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(["userProfile", userId], updatedProfile);
      await queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      toast.success("บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว");
      form.reset({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        mobilePhone: updatedProfile.mobilePhone ?? "",
        officePhone: updatedProfile.officePhone ?? "",
        internalExtension: updatedProfile.internalExtension ?? "",
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้"),
  });

  if (profileQuery.isLoading) return <div className="container mx-auto py-10">กำลังโหลดข้อมูลโปรไฟล์...</div>;
  if (profileQuery.isError || !profileQuery.data) return <div className="container mx-auto py-10 text-destructive">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้</div>;

  const profile = profileQuery.data;
  const errors = form.formState.errors;
  const division = profile.division ? `${profile.division.divisionName} (${profile.division.departmentName})` : "-";
  const roles = profile.roles.map((role) => role.roleName).join(", ") || "-";

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขข้อมูลส่วนตัว</h1>
        <p className="mt-1 text-muted-foreground">ปรับปรุงชื่อและข้อมูลติดต่อของคุณ</p>
      </div>

      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><User className="h-5 w-5 text-primary" /> ข้อมูลที่แก้ไขได้</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ชื่อ" name="firstName" register={form.register} error={errors.firstName?.message} />
            <Field label="นามสกุล" name="lastName" register={form.register} error={errors.lastName?.message} />
            <Field label="โทรศัพท์มือถือ" name="mobilePhone" register={form.register} error={errors.mobilePhone?.message} />
            <Field label="โทรศัพท์สำนักงาน" name="officePhone" register={form.register} error={errors.officePhone?.message} />
            <Field label="หมายเลขภายใน" name="internalExtension" register={form.register} error={errors.internalExtension?.message} />
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><ShieldCheck className="h-5 w-5 text-primary" /> ข้อมูลบัญชีที่แก้ไขไม่ได้</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ReadOnly label="ชื่อผู้ใช้" value={profile.username} icon={<User />} />
            <ReadOnly label="อีเมล" value={profile.email} icon={<Mail />} />
            <ReadOnly label="ตำแหน่งงาน" value={profile.position || "-"} icon={<Briefcase />} />
            <ReadOnly label="หน่วยงาน" value={division} icon={<Building2 />} />
            <ReadOnly label="สิทธิ์การใช้งาน" value={roles} icon={<ShieldCheck />} />
            <ReadOnly label="สถานะบัญชี" value={profile.isActive ? "ใช้งานอยู่" : "ระงับการใช้งาน"} icon={<Smartphone />} />
            <ReadOnly label="วันที่สร้างบัญชี" value={new Date(profile.createdAt).toLocaleDateString("th-TH")} icon={<CalendarDays />} />
          </div>
        </section>

        <Separator />
        <Button type="submit" disabled={!form.formState.isDirty || mutation.isPending} className="gap-2">
          <Save className="h-4 w-4" /> {mutation.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </Button>
      </form>
    </div>
  );
}

function ReadOnly({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
      <span className="text-primary">{icon}</span>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>
    </div>
  );
}
