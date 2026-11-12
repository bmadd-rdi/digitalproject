import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Trash2, Plus, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SoftwareCostSection() {
  const { control, register, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "softwareCosts",
  });

  return (
    <div className="space-y-4">
      {/* ส่วนหัวของ Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-foreground">
          ค่าใช้จ่ายซอฟต์แวร์ที่จัดหาในโครงการ 
        </h3>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() =>
            append({
              itemName: "",
              quantity: 1,
              unitPrice: 0,
              referenceType: "MDES",
            })
          }
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> เพิ่มรายการ
        </Button>
      </div>

      {/* Table-Grid Layout */}
      <div className="border rounded-md bg-card overflow-hidden shadow-sm">
        
        {/* หัวตาราง (ซ่อนในจอมือถือ) */}
        <div className="hidden md:flex items-center gap-3 bg-muted/50 p-3 text-xs font-medium text-muted-foreground border-b">
          <div className="w-8 text-center">ลำดับ</div> {/* 📍 เพิ่มคอลัมน์ลำดับ */}
          <div className="flex-1">ชื่อรายการซอฟต์แวร์</div>
          <div className="w-24 text-right">จำนวน (License)</div>
          <div className="w-32 text-right">ราคา/หน่วย (บาท)</div>
          <div className="w-48">ที่มาของราคากลาง</div>
          <div className="w-8"></div>
        </div>

        {/* รายการข้อมูล */}
        <div className="divide-y">
          {fields.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              ยังไม่มีรายการซอฟต์แวร์ กดปุ่ม &quot;เพิ่มรายการ&quot; เพื่อเริ่มต้น
            </div>
          )}

          {fields.map((field, index) => {
            const refType = watch(`softwareCosts.${index}.referenceType`);

            return (
              <div key={field.id} className="p-3 transition-colors hover:bg-muted/20 group">
                
                {/* แถวหลัก: ข้อมูลพื้นฐาน */}
                <div className="flex flex-col md:flex-row items-start gap-3">
                
                  {/* เลข Index */}
                  <div className="hidden md:flex w-8 h-9 items-center justify-center text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </div>

                  {/* ชื่อรายการ */}
                  <div className="flex-1 w-full">
                    <label className="md:hidden text-xs font-medium mb-1 flex items-center gap-1">
                      <span className="bg-muted px-1.5 rounded-sm text-muted-foreground">{index + 1}</span> ชื่อรายการซอฟต์แวร์
                    </label>
                    <Input
                      {...register(`softwareCosts.${index}.itemName`)}
                      placeholder="ระบุชื่อซอฟต์แวร์ หรือ License..."
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* จำนวน */}
                  <div className="w-full md:w-24">
                    <label className="md:hidden text-xs font-medium mb-1 block">จำนวน</label>
                    <Input
                      type="number"
                      {...register(`softwareCosts.${index}.quantity`)}
                      className="h-9 text-sm text-right"
                    />
                  </div>

                  {/* ราคาต่อหน่วย */}
                  <div className="w-full md:w-32">
                    <label className="md:hidden text-xs font-medium mb-1 block">ราคา/หน่วย</label>
                    <Input
                      type="number"
                      {...register(`softwareCosts.${index}.unitPrice`)}
                      className="h-9 text-sm text-right"
                    />
                  </div>

                  {/* ที่มาของราคากลาง */}
                  <div className="w-full md:w-48">
                    <label className="md:hidden text-xs font-medium mb-1 block">ที่มาของราคากลาง</label>
                    <Controller
                      control={control}
                      name={`softwareCosts.${index}.referenceType`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-9 text-sm bg-white">
                            <SelectValue placeholder="เลือกที่มา..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MDES">กระทรวงดิจิทัลฯ</SelectItem>
                            <SelectItem value="MARKET">สืบราคาฯ</SelectItem>
                            <SelectItem value="PREVIOUS">ราคาที่เคยจัดหาฯ</SelectItem>
                            <SelectItem value="OTHER">อื่นๆ</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* ปุ่มลบ */}
                  <div className="w-full md:w-8 flex justify-end md:justify-center md:pt-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Conditional UI: ซ้อนอยู่ด้านล่างแถวหลัก */}
                <div className="mt-3 flex gap-2">
                  {/* เว้นพื้นที่ให้ตรงกับคอลัมน์ Index และชี้ลูกศร */}
                  <div className="hidden md:flex w-8 justify-center pt-2 text-muted-foreground/40">
                    <CornerDownRight className="w-4 h-4 ml-2" />
                  </div>
                  
                  <div className="flex-1 bg-muted/40 p-3 rounded-md border border-border/50">
                    
                    {refType === "MDES" && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Input {...register(`softwareCosts.${index}.mdesMonth`)} placeholder="ฉบับเดือน  (เช่น มีนาคม)" className="h-8 text-xs bg-background" />
                        </div>
                        <div>
                          <Input {...register(`softwareCosts.${index}.mdesYear`)} placeholder="พ.ศ. (เช่น 2567)" className="h-8 text-xs bg-background" />
                        </div>
                        <div>
                          <Input {...register(`softwareCosts.${index}.mdesItemNo`)} placeholder="รายการที่ (เช่น 1)" className="h-8 text-xs bg-background" />
                        </div>
                      </div>
                    )}

                    {refType === "MARKET" && (
                      <div className="flex gap-3">
                        <div className="w-32">
                          <Input type="number" {...register(`softwareCosts.${index}.marketCount`)} placeholder="จำนวน (เช่น 5)" className="h-8 text-xs bg-background" />
                        </div>
                        <div className="flex-1">
                          <Input {...register(`softwareCosts.${index}.marketCompany`)} placeholder="ใช้ของบริษัท (เช่น บริษัท XYZ)" className="h-8 text-xs bg-background" />
                        </div>
                      </div>
                    )}

                    {refType === "PREVIOUS" && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input {...register(`softwareCosts.${index}.prevProject`)} placeholder="ชื่อโครงการ (เช่น โครงการ ABC)" className="h-8 text-xs bg-background" />
                        </div>
                        <div className="w-32">
                          <Input {...register(`softwareCosts.${index}.prevYear`)} placeholder="ปี พ.ศ. (เช่น 2567)" className="h-8 text-xs bg-background" />
                        </div>
                      </div>
                    )}

                    {refType === "OTHER" && (
                      <div className="w-full">
                        <Input {...register(`softwareCosts.${index}.otherDetail`)} placeholder="ระบุเหตุผลและรายละเอียดที่มา" className="h-8 text-xs bg-background" />
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}