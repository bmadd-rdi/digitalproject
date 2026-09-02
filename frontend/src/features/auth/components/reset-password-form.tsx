"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { resetPasswordAction } from "@/features/auth/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./auth-shell";

const resetSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async ({ newPassword }: ResetValues) => {
    setStatus(null);
    if (!token) {
      setStatus({
        type: "error",
        message: "This password reset link is missing or invalid.",
      });
      return;
    }

    const response = await resetPasswordAction(token, newPassword);
    setStatus({
      type: response.success ? "success" : "error",
      message: response.message,
    });
  };

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a new password for your BMA Digital Project account."
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

      {status?.type === "success" ? (
        <Button asChild className="h-12 w-full rounded-full">
          <Link href="/login">Continue to login</Link>
        </Button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                error={!!errors.newPassword}
                {...register("newPassword")}
                className="h-12 rounded-full bg-surface pl-11"
              />
            </div>
            {errors.newPassword && (
              <p className="text-sm font-medium text-status-orange">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                {...register("confirmPassword")}
                className="h-12 rounded-full bg-surface pl-11"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm font-medium text-status-orange">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-full text-base font-medium"
          >
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
