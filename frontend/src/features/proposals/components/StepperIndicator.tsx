import { Check, X } from "lucide-react";
import { useProposalFormStore } from "../stores/useProposalFormStore";

export const StepperIndicator = ({ validateCurrentStep }: { validateCurrentStep: () => Promise<boolean> }) => {
  const currentStep = useProposalFormStore((state) => state.currentStep);
  const setStep = useProposalFormStore((state) => state.setStep);
  const stepErrors = useProposalFormStore((state) => state.stepErrors);
  
  const steps = ["ข้อมูลทั่วไป", "สาระสำคัญ", "สถาปัตยกรรม (EA)", "งบประมาณ", "ความพร้อม"];
  const stepsSm = ["ข้อมูลทั่วไป", "สาระสำคัญ", "EA", "งบ", "ความพร้อม"];

  // ฟังก์ชันเปลี่ยนสเต็ปจากการคลิก
  const handleStepClick = async (targetStep: number) => {
    if (targetStep === currentStep) return;
    
    // Validate for error indicators, but never block navigation.
    void validateCurrentStep();
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mb-12 w-full px-2 sm:px-6">
      <div className="flex w-full items-center justify-between">
        {steps.map((fullLabel, index) => {
          const shortLabel = stepsSm[index];
          const stepNum = index + 1;
          
          const isActive = currentStep === stepNum;
          const isPast = currentStep > stepNum;
          const isLast = stepNum === steps.length;
          const hasError = stepErrors.includes(stepNum); // ตรวจสอบว่ามี Error ไหม

          return (
            <div key={fullLabel} className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}>
              
              <div 
                className="relative flex flex-col items-center group cursor-pointer"
                onClick={() => handleStepClick(stepNum)} // สั่งให้กดเพื่อย้ายหน้าได้
              >
                {/* วงกลม (Step Circle) */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ease-in-out z-10 ${
                    isActive && !hasError
                      ? "bg-primary-container text-primary shadow-md ring-2 ring-primary scale-110" 
                    : isActive && hasError
                      ? "bg-red-100 text-red-600 shadow-md ring-2 ring-red-500 scale-110" // สีตอน Active แบบมี Error
                    : hasError
                      ? "bg-red-500 text-white shadow-sm ring-2 ring-red-200" // สีตอนไม่ได้ Active แต่มี Error ค้าง
                    : isPast
                      ? "bg-primary text-surface shadow-sm hover:bg-primary/90" 
                    : "bg-surface-container border-2 border-border text-slate-gray hover:border-primary/50" 
                  }`}
                >
                  {/* สลับการแสดงผล Icon (Error, Success, Number) */}
                  {hasError && !isActive ? (
                    <X className="h-5 w-5 stroke-[3px] text-white" />
                  ) : isPast && !hasError ? (
                    <Check className="h-5 w-5 stroke-[3px] text-white" />
                  ) : (
                    stepNum
                  )}
                </div>
                
                {/* ตัวหนังสือ (Label) */}
                <div className="absolute top-14 flex w-24 sm:w-32 justify-center">
                  <span
                    className={`text-xs sm:text-sm text-center transition-all duration-300 ${
                      isActive && !hasError ? "font-bold text-primary-container"
                      : hasError ? "font-bold text-red-500" // ตัวหนังสือแดงถ้ามี Error
                      : isPast ? "font-medium text-foreground"
                      : "font-medium text-slate-gray group-hover:text-primary/70"
                    }`}
                  >
                    <span className="sm:hidden">{shortLabel}</span>
                    <span className="hidden sm:inline">{fullLabel}</span>
                  </span>
                </div>
              </div>

              {/* เส้นเชื่อม (Connecting Line) */}
              {!isLast && (
                <div className="flex-1 mx-2 sm:mx-4 flex items-center">
                  <div 
                    className={`h-0.5 w-full rounded-full transition-all duration-500 ease-in-out ${
                      // เปลี่ยนสีเส้นตามสถานะ (ถ้ามี Error ให้เส้นเป็นสีเทาหรือแดง)
                      isPast && !hasError ? "bg-primary" : "bg-border"
                    }`} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="h-6" /> 
    </div>
  );
};
