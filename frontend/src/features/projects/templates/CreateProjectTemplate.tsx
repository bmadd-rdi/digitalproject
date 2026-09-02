"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { AlertCircle, Save, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createProjectAction } from "@/features/projects/actions/project.actions";
import {
  useFourQuadrants,
  useDeputyGovernors,
} from "@/features/lookups/hooks/useLookups";
import { schemas } from "@/types/api-schemas";

const baseSchema = schemas.CreateProjectRequest;

export const createProjectSchema = baseSchema.extend({
  projectName: z
    .string({ message: "กรุณาระบุชื่อโครงการ" })
    .min(5, "กรุณาระบุชื่อโครงการอย่างน้อย 5 ตัวอักษร")
    .max(500, "ชื่อโครงการต้องไม่เกิน 500 ตัวอักษร"),

  fourQuadrantsId: z.coerce
    .number({
      message: "กรุณาเลือกมิติการพัฒนา",
    })
    .min(1, "กรุณาเลือกมิติการพัฒนา"),

  deputyGovernorId: z.coerce
    .number({
      message: "กรุณาเลือกรองผู้ว่าฯ ที่กำกับดูแล",
    })
    .min(1, "กรุณาเลือกรองผู้ว่าฯ ที่กำกับดูแล"),
});

type CreateProjectFormInput = z.input<typeof createProjectSchema>;
type CreateProjectValues = z.infer<typeof createProjectSchema>;

export function CreateProjectTemplate() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: quadrantsRes, isLoading: isLoadingQuadrants } =
    useFourQuadrants();
  const { data: governorsRes, isLoading: isLoadingGovernors } =
    useDeputyGovernors();

  const quadrants = quadrantsRes?.data || [];
  const governors = governorsRes?.data || [];

  const mockContext = {
    userId: "018f3a3b-1b2c-7d3e-8f4g-5h6i7j8k9l0m",
    divisionId: 1,
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormInput, undefined, CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      projectName: "",
      fourQuadrantsId: undefined,
      deputyGovernorId: undefined,
    },
  });

  const onSubmit = async (data: CreateProjectValues) => {
    const payload = {
      projectName: data.projectName,
      fourQuadrantsId: data.fourQuadrantsId,
      deputyGovernorId: data.deputyGovernorId,
      projectStatusId: 1,
      userId: mockContext.userId,
      divisionId: mockContext.divisionId,
    };

    const response = await createProjectAction(payload);

    // Toast notification for success or error
    if (response.success) {
      // Mark every project-list variant stale before returning to the list.
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("สร้างโครงการสำเร็จ", {
        description: "ระบบได้ทำการบันทึกร่างโครงการของคุณเรียบร้อยแล้ว",
      });
      router.push("/projects");
      router.refresh();
    } else {
      toast.error("สร้างโครงการไม่สำเร็จ", {
        description:
          response.message ||
          "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  return (
    <div className="mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
          สร้างโครงการใหม่
        </h2>
        <p className="text-sm text-slate-gray mt-2">
          กรอกข้อมูลเบื้องต้นเพื่อเริ่มต้นร่างข้อเสนอโครงการ
        </p>
      </div>

      {/* Form เนื้อหาหลัก */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* ชื่อโครงการ */}
        <div className="w-full">
          <Label
            htmlFor="projectName"
            className="text-sm font-medium text-foreground mb-1.5 block"
          >
            ชื่อโครงการ <span className="text-status-orange">*</span>
          </Label>
          <Textarea
            id="projectName"
            {...register("projectName")}
            rows={3}
            placeholder="ระบุชื่อโครงการ..."
            className={cn(
              "resize-none bg-surface text-base",
              errors.projectName &&
                "border-status-orange focus-visible:ring-status-orange bg-orange-50/50",
            )}
          />
          {errors.projectName && (
            <p className="mt-1.5 text-sm text-status-orange flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.projectName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 4 Quadrants Model */}
          <div className="w-full">
            <Label className="text-sm font-medium text-foreground mb-1.5 block">
              4 Quadrants Model <span className="text-status-orange">*</span>
            </Label>
            <Controller
              control={control}
              name="fourQuadrantsId"
              render={({ field: { onChange, value } }) => (
                <Select
                  onValueChange={(val) => onChange(Number(val))}
                  value={value?.toString() || ""}
                  disabled={isLoadingQuadrants || isSubmitting}
                >
                  <SelectTrigger
                    className={cn(
                      "bg-surface",
                      errors.fourQuadrantsId &&
                        "border-status-orange ring-1 ring-status-orange bg-orange-50/50",
                    )}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingQuadrants
                          ? "กำลังโหลดข้อมูล..."
                          : "เลือกมิติการพัฒนา..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {quadrants.map((q) => (
                      <SelectItem key={q.id} value={q.id.toString()}>
                        {q.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.fourQuadrantsId && (
              <p className="mt-1.5 text-sm text-status-orange flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />{" "}
                {errors.fourQuadrantsId.message}
              </p>
            )}
          </div>

          {/* รองผู้ว่าฯ ที่ดูแล */}
          <div className="w-full">
            <Label className="text-sm font-medium text-foreground mb-1.5 block">
              รองผู้ว่าฯ ที่กำกับดูแล{" "}
              <span className="text-status-orange">*</span>
            </Label>
            <Controller
              control={control}
              name="deputyGovernorId"
              render={({ field: { onChange, value } }) => (
                <Select
                  onValueChange={(val) => onChange(Number(val))}
                  value={value?.toString() || ""}
                  disabled={isLoadingGovernors || isSubmitting}
                >
                  <SelectTrigger
                    className={cn(
                      "bg-surface",
                      errors.deputyGovernorId &&
                        "border-status-orange ring-1 ring-status-orange bg-orange-50/50",
                    )}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingGovernors
                          ? "กำลังโหลดข้อมูล..."
                          : "เลือกรองผู้ว่าฯ..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {governors.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id.toString()}>
                        {gov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.deputyGovernorId && (
              <p className="mt-1.5 text-sm text-status-orange flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />{" "}
                {errors.deputyGovernorId.message}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border mt-2" />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingQuadrants || isLoadingGovernors}
            className="rounded-full bg-primary hover:bg-primary/90 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกและสร้างโครงการ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
