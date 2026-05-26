"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface DecisionBannerProps {
  decision: "ACCEPTED" | "REJECTED";
}

export function DecisionBanner({ decision }: DecisionBannerProps) {
  const isAccepted = decision === "ACCEPTED";

  return (
    <Alert
      variant={isAccepted ? "default" : "destructive"}
      className={
        isAccepted
          ? "border-green-500 bg-green-50 text-green-900"
          : undefined
      }
    >
      {isAccepted ? (
        <CheckCircle className="size-5 text-green-600" />
      ) : (
        <XCircle className="size-5" />
      )}
      <AlertTitle className="text-lg font-semibold">
        {isAccepted ? "CLAIM APPROVED" : "CLAIM REJECTED"}
      </AlertTitle>
      <AlertDescription>
        {isAccepted
          ? "All validation checks passed. The claim has been approved for processing."
          : "One or more validation checks failed. Please review the comparison details below."}
      </AlertDescription>
    </Alert>
  );
}
