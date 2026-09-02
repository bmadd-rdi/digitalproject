// src/app/(protected)/meetings/create/page.tsx
import { CreateMeetingForm } from "@/features/meetings/components/CreateMeetingForm";

export default function CreateMeetingPage() {
  return (
    <div className="min-h-full bg-slate-50/50 p-6 lg:p-8">
      <CreateMeetingForm />
    </div>
  );
}
