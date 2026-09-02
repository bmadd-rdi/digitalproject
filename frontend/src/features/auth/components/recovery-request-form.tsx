"use client";

import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./auth-shell";
import {
  requestPasswordResetAction,
  requestUsernameRecoveryAction,
} from "@/features/auth/actions/auth.actions";

const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

type RecoveryValues = z.infer<typeof emailSchema>;
type RecoveryMode = "username" | "password";

type RecoveryRequestFormProps = {
  mode: RecoveryMode;
};

export function RecoveryRequestForm({ mode }: RecoveryRequestFormProps) {
  const isUsernameRecovery = mode === "username";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const onSubmit = async ({ email }: RecoveryValues) => {
    setStatus(null);
    const response = isUsernameRecovery
      ? await requestUsernameRecoveryAction(email)
      : await requestPasswordResetAction(email);

    setStatus({
      type: response.success ? "success" : "error",
      message: response.message,
    });
  };

  return (
    <AuthShell
      title={isUsernameRecovery ? "ลืมชื่อบัญชีผู้ใช้?" : "ลืมรหัสผ่าน?"}
      description={
        isUsernameRecovery
          // ? "Enter your registered email address and we will send your username if an account matches."
          ? "กรุณากรอกอีเมลที่ลงทะเบียนไว้ และเราจะส่งชื่อผู้ใช้ของคุณไปยังอีเมลนั้น หากมีบัญชีที่ตรงกัน"
          // : "Enter your registered email address and we will send a secure password reset link if an account matches."
          : "กรุณากรอกอีเมลที่ลงทะเบียนไว้ และเราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลนั้น หากมีบัญชีที่ตรงกัน"
      }
      maxWidth="max-w-lg"
    >
      {status && (
        <div
          role="status"
          className={`mb-6 rounded-md border p-4 text-sm font-medium ${
            status.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="recovery-email">Email ที่ลงทะเบียนไว้</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              error={!!errors.email}
              {...register("email")}
              className="h-12 rounded-full bg-surface pl-11"
            />
          </div>
          {errors.email && (
            <p className="text-sm font-medium text-status-orange">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-full text-base font-medium"
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting
            ? "Sending..."
            : isUsernameRecovery
              ? "ยืนยันการหาชื่อผู้ใช้"
              : "ยืนยันการรีเซ็ตรหัสผ่าน"}
        </Button>

        <div className="flex flex-wrap justify-between gap-x-4 gap-y-2 text-sm text-primary-dark">
          <Link href="/login" className="font-medium text-primary hover:underline">
            กลับไปยังหน้าเข้าสู่ระบบ
          </Link>
          {isUsernameRecovery ? (
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          ) : (
            <Link href="/forgot-username" className="font-medium text-primary hover:underline">
              Forgot username?
            </Link>
          )}
        </div>
      </form>
    </AuthShell>
  );
}
