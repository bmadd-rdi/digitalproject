"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthShell } from "./auth-shell";
import { loginUserAction } from "@/features/auth/actions/auth.actions";

const loginSchema = z.object({
  username: z
    .string()
    .min(3, "กรุณากรอกชื่อผู้ใช้หรืออีเมลอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: LoginValues) => {
    setStatusMessage(null);
    const response = await loginUserAction(values);

    if (response.success) {
      setStatusMessage({ type: "success", text: response.message });
      setTimeout(() => router.push("/projects"), 1000);
    } else {
      if (response.field === "general") {
        setStatusMessage({
          type: "warning",
          text: response.message || "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: response.message || "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง",
        });
        setValue("password", "");
      }
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login triggered");
    // TODO: เชื่อมต่อกับ NextAuth หรือ OAuth Providers ตรงนี้ในอนาคต
  };

  return (
    <AuthShell
      title="เข้าสู่ระบบ"
      description="ลงชื่อเข้าใช้เพื่อเข้าถึงระบบจัดการโครงการและข้อมูลบัญชีของคุณ"
      maxWidth="max-w-lg"
    >
      {statusMessage && (
        <div
          className={`p-4 mb-6 rounded-md text-sm font-medium animate-in fade-in slide-in-from-top-2 border ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : statusMessage.type === "warning"
                ? "bg-orange-50 text-orange-700 border-orange-200"
                : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 sm:space-y-5"
      >
        {/* --- Username / Email Field --- */}
        <div className="space-y-1.5 sm:space-y-2">
          {/* 💡 วางลิงก์ลืม Username ไว้ตรงข้ามกับ Label */}
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="username"
              className="text-base font-medium text-foreground"
            >
              Username หรือ Email
            </Label>
            <Link href="/forgot-username">
              <p className="text-sm font-medium text-primary transition-colors hover:underline hover:text-primary/80 whitespace-nowrap">
                ลืม Username?
              </p>
            </Link>
          </div>
          <Input
            id="username"
            autoComplete="username"
            placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล"
            error={!!errors.username}
            {...register("username")}
            className="h-12 rounded-full bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
          />
          {errors.username && (
            <p className="text-sm font-medium text-status-orange animate-in fade-in-50 duration-200">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* --- Password Field --- */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="password"
              className="text-base font-medium text-foreground whitespace-nowrap"
            >
              Password
            </Label>
            <Link href="/forgot-password">
              <p className="text-sm font-medium text-primary transition-colors hover:underline hover:text-primary/80 whitespace-nowrap">
                ลืมรหัสผ่าน?
              </p>
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่าน"
              error={!!errors.password}
              {...register("password")}
              className="h-12 rounded-full bg-surface px-4 pr-12 text-foreground focus-visible:ring-primary-light text-base transition-all"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground size-9 flex items-center justify-center"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="size-4 sm:size-5" />
              ) : (
                <EyeOff className="size-4 sm:size-5" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm font-medium text-status-orange animate-in fade-in-50 duration-200">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* ปุ่ม Login หลัก */}
        <Button
          type="submit"
          size="lg"
          className="h-12 mt-2 w-full rounded-full border-none text-base font-medium shadow-sm active:scale-[0.99] transition-transform"
          disabled={isSubmitting}
        >
          Login
        </Button>

        {/* เส้นคั่น "หรือ" */}
        

        {/* ปุ่ม Login ด้วย Google */}
        

        <span className="flex flex-row items-end gap-1 mx-auto justify-center pt-2">
          <p className="text-center text-base text-muted-foreground">
            ยังไม่มีบัญชี?
          </p>
          <Link href="/register">
            <p className="text-base font-semibold text-primary transition-colors hover:underline hover:text-primary/80 whitespace-nowrap">
              ลงทะเบียน
            </p>
          </Link>
        </span>
      </form>
    </AuthShell>
  );
}
