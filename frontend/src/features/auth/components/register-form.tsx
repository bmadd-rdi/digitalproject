// src/features/auth/components/register-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { AuthShell } from "./auth-shell";
import {
  useDepartments,
  useDivisions,
} from "@/features/lookups/hooks/useLookups";

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { registerUserAction } from "@/features/auth/actions/auth.actions";
import { schemas } from "@/types/api-schemas";
import { z } from "zod";
import { RegisterValues, RegisterFieldProps, registerSchema } from "../type";

function RegisterField({
  label,
  error,
  className,
  children,
}: RegisterFieldProps) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-base font-medium text-foreground">{label}</Label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-status-orange animate-in fade-in-50 duration-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface FormComboboxProps {
  options: { id: number; name: string }[];
  value: number | undefined;
  onChange: (val: number) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

const FormCombobox = ({
  options,
  value,
  onChange,
  placeholder = "ค้นหาหรือเลือก...",
  error,
  className,
  disabled = false,
}: FormComboboxProps) => {
  const [inputValue, setInputValue] = useState("");

  // หารายการที่ถูกเลือกเพื่อมาโชว์ค่าให้ถูกต้อง
  const selectedOption = options.find((opt) => opt.id === value);
  const displayValue = selectedOption ? selectedOption.name : "";

  // กรองตัวเลือกด้วยชื่อ (หาก Combobox ของคุณไม่มีระบบกรองในตัว)
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <Combobox
      // ส่งค่า value เป็น "ชื่อ" เพื่อให้ UI โชว์เป็น String
      value={displayValue}
      onValueChange={(valName) => {
        // เมื่อเลือกเสร็จ จะได้ชื่อมา ให้เราเอาชื่อไปหา ID เพื่อส่งกลับไปให้ React Hook Form
        const selected = options.find((opt) => opt.name === valName);
        if (selected) {
          onChange(selected.id);
          setInputValue(selected.name);
        } else {
          onChange(0);
        }
      }}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        className={cn(
          "w-full bg-surface",
          className,
          disabled && "opacity-50 cursor-not-allowed",
        )}
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

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      position: "",
      level: "",
      managementPosition: "",
      email: "",
      mobilePhone: "",
      officePhone: "",
      internalExtension: "",
      departmentId: 0,
      divisionId: 0,
    },
    mode: "onChange",
  });

  // 1. สังเกตค่า Department ID ที่ถูกเลือก
  const selectedDepartmentId = useWatch({ control, name: "departmentId" });

  // 2. เรียกใช้ Hook ดึงข้อมูลจาก API
  const { data: deptsRes } = useDepartments();
  const { data: divsRes } = useDivisions(selectedDepartmentId);

  const departments = deptsRes?.data || [];
  const divisions = divsRes?.data || [];

  const onSubmit = async (values: RegisterValues) => {
    // โครงสร้าง values ตรงกับ CreateUserRequest แล้ว จึงลบฟิลด์ของ Frontend ออกได้เลย
    const { confirmPassword, departmentId, ...requestValues } = values;
    void confirmPassword;
    void departmentId;
    const payload: z.infer<typeof schemas.CreateUserRequest> = {
      ...requestValues,
      roleIds: [1],
    };

    // ลบฟิลด์ที่มีเฉพาะหน้าจอออกก่อนส่ง API
    // ระบบจะนำ dataToSend ที่มี divisionId ไปยิง API ทันที
    const response = await registerUserAction(payload);

    if (response.success) {
      setStatusMessage({
        type: "success",
        text: response.message + " ระบบกำลังพาท่านไปหน้าเข้าสู่ระบบ...",
      });
      reset();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      if (response.field) {
        setError(response.field as keyof RegisterValues, {
          type: "server",
          message: response.message,
        });
      } else {
        setStatusMessage({ type: "error", text: response.message });
      }
    }
  };

  return (
    <AuthShell
      title="สร้างบัญชีผู้ใช้งานใหม่ (Register)"
      description="กรอกข้อมูลผู้ใช้งานและข้อมูลติดต่อเพื่อสร้างบัญชีใหม่ในระบบ"
      maxWidth="max-w-5xl"
    >
      {statusMessage && (
        <div
          className={`p-4 mb-6 rounded-md text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
            statusMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {statusMessage.text}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Section 1: ข้อมูลบัญชี (Account Information) --- */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              ข้อมูลบัญชี (Account Information)
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <RegisterField
              label="ชื่อผู้ใช้ (Username)"
              error={errors.username?.message}
              className="md:col-span-2"
            >
              <Input
                id="username"
                placeholder="กรอกชื่อผู้ใช้"
                {...register("username")}
                error={!!errors.username}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>
            <RegisterField
              label="รหัสผ่าน (Password)"
              error={errors.password?.message}
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  {...register("password")}
                  error={!!errors.password}
                  className="h-12 rounded-full border bg-surface px-4 pr-12 text-foreground focus-visible:ring-primary-light text-base transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground size-9 flex items-center justify-center"
                >
                  {showPassword ? (
                    <Eye className="size-4 sm:size-5" />
                  ) : (
                    <EyeOff className="size-4 sm:size-5" />
                  )}
                </Button>
              </div>
            </RegisterField>
            <RegisterField
              label="ยืนยันรหัสผ่าน (Confirm Password)"
              error={errors.confirmPassword?.message}
            >
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่านให้ตรงกัน"
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  className="h-12 rounded-full border bg-surface px-4 pr-12 text-foreground focus-visible:ring-primary-light text-base transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground size-9 flex items-center justify-center"
                >
                  {showConfirmPassword ? (
                    <Eye className="size-4 sm:size-5" />
                  ) : (
                    <EyeOff className="size-4 sm:size-5" />
                  )}
                </Button>
              </div>
            </RegisterField>
          </div>
        </section>

        {/* --- Section 2: ข้อมูลส่วนบุคคล (Personal Information) --- */}
        <section className="space-y-4 border-t border-border pt-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              ข้อมูลส่วนบุคคล (Personal Information)
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <RegisterField label="ชื่อจริง" error={errors.firstName?.message}>
              <Input
                id="firstName"
                placeholder="ชื่อภาษาไทย"
                {...register("firstName")}
                error={!!errors.firstName}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>
            <RegisterField label="นามสกุล" error={errors.lastName?.message}>
              <Input
                id="lastName"
                placeholder="นามสกุลภาษาไทย"
                {...register("lastName")}
                error={!!errors.lastName}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>

            {/* 💡 ฟิลด์ใหม่ที่เพิ่มขึ้นมา */}
            <RegisterField
              label="ตำแหน่ง (Position)"
              error={errors.position?.message}
              className="md:col-span-2"
            >
              <Input
                id="position"
                placeholder="เช่น นักวิชาการคอมพิวเตอร์"
                {...register("position")}
                error={!!errors.position}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>

            <RegisterField
              label="ระดับปฏิบัติงาน (Level)"
              error={errors.level?.message}
            >
              <Input
                id="level"
                placeholder="เช่น ปฏิบัติการ, ชำนาญการ (ถ้ามี)"
                {...register("level")}
                error={!!errors.level}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>

            <RegisterField
              label="ตำแหน่งบริหาร (Management Position)"
              error={errors.managementPosition?.message}
            >
              <Input
                id="managementPosition"
                placeholder="เช่น ผู้อำนวยการกอง (ถ้ามี)"
                {...register("managementPosition")}
                error={!!errors.managementPosition}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>
          </div>
        </section>

        {/* --- Section 3: ข้อมูลหน่วยงานและช่องทางติดต่อ (Agency & Contact Information) --- */}
        <section className="space-y-4 border-t border-border pt-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              ข้อมูลหน่วยงานและช่องทางติดต่อ
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <RegisterField
              label="หน่วยงาน (Department)"
              error={errors.departmentId?.message}
            >
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <FormCombobox
                    options={departments}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue("divisionId", 0, { shouldValidate: true });
                    }}
                    placeholder="ค้นหาหรือเลือกหน่วยงาน..."
                    error={!!errors.departmentId}
                    className="h-12 rounded-full px-1.5 text-base"
                  />
                )}
              />
            </RegisterField>

            <RegisterField
              label="ส่วนราชการ (Division)"
              error={errors.divisionId?.message}
            >
              <Controller
                control={control}
                name="divisionId"
                render={({ field }) => (
                  <FormCombobox
                    options={divisions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={
                      selectedDepartmentId
                        ? "ค้นหาหรือเลือกส่วนราชการ..."
                        : "กรุณาเลือกหน่วยงานก่อน"
                    }
                    error={!!errors.divisionId}
                    className="h-12 rounded-full px-1.5 text-base"
                    disabled={
                      !selectedDepartmentId || selectedDepartmentId === 0
                    }
                  />
                )}
              />
            </RegisterField>

            <RegisterField
              label="Email"
              error={errors.email?.message}
              className="md:col-span-2"
            >
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                {...register("email")}
                error={!!errors.email}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>

            <RegisterField
              label="เบอร์โทรศัพท์มือถือ (Mobile Phone)"
              error={errors.mobilePhone?.message}
            >
              <Input
                id="mobilePhone"
                type="tel"
                placeholder="08X-XXX-XXXX"
                {...register("mobilePhone")}
                error={!!errors.mobilePhone}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>

            <RegisterField
              label="เบอร์โทรศัพท์สำนักงาน (Office Phone)"
              error={errors.officePhone?.message}
            >
              <Input
                id="officePhone"
                type="tel"
                placeholder="02-XXX-XXXX"
                {...register("officePhone")}
                error={!!errors.officePhone}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>

            <RegisterField
              label="เบอร์ภายใน (Internal Extension)"
              error={errors.internalExtension?.message}
              className="md:col-span-2"
            >
              <Input
                id="internalExtension"
                inputMode="numeric"
                placeholder="เช่น 1234"
                {...register("internalExtension")}
                error={!!errors.internalExtension}
                className="h-12 rounded-full border bg-surface px-4 text-foreground focus-visible:ring-primary-light text-base transition-all"
              />
            </RegisterField>
          </div>
        </section>

        {/* --- ปุ่มส่งข้อมูล --- */}
        <div className="space-y-4 border-t border-border pt-6">
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full border-none text-base font-medium shadow-sm active:scale-[0.99] transition-transform"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังส่งข้อมูล..." : "ลงทะเบียน (Register)"}
          </Button>
          <div className="flex flex-row items-center gap-1 mx-auto justify-center pt-2">
            <p className="text-center text-base text-muted-foreground">
              มีบัญชีผู้ใช้งานอยู่แล้ว?
            </p>
            <Link href="/login">
              <p className="text-base font-semibold text-primary transition-colors hover:underline hover:text-primary/80 whitespace-nowrap">
                เข้าสู่ระบบ (Login)
              </p>
            </Link>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
