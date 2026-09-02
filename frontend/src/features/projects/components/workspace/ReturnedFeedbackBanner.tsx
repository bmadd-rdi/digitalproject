import { MessageSquareWarning } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ProjectDetail } from "../../types/workspace";

const RETURNED_STATUS_IDS = new Set([3, 7, 10, 13]);

export function ReturnedFeedbackBanner({ project }: { project: ProjectDetail }) {
  const feedback = project.latestReturnFeedback;

  if (!feedback || !RETURNED_STATUS_IDS.has(project.projectStatusId ?? -1)) {
    return null;
  }

  const reviewerName = feedback.reviewer
    ? `${feedback.reviewer.firstName} ${feedback.reviewer.lastName}`.trim()
    : "";

  return (
    <Alert variant="warning" className="flex items-start gap-3">
      <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />
      <div className="min-w-0">
        <AlertTitle>Returned for Revision</AlertTitle>
        <AlertDescription>
          <p className="whitespace-pre-wrap break-words">{feedback.remark || "Please review and update the proposal."}</p>
          <p className="mt-2 text-xs text-orange-800/80">
            {feedback.reviewerRole}
            {reviewerName ? ` · ${reviewerName}` : ""}
            {" · "}
            {new Intl.DateTimeFormat("th-TH", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(feedback.createdAt))}
          </p>
        </AlertDescription>
      </div>
    </Alert>
  );
}
