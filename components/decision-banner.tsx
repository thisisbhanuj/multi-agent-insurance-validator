"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionBannerProps {
  decision: "ACCEPTED" | "REJECTED";
}

export function DecisionBanner({ decision }: DecisionBannerProps) {
  const isAccepted = decision === "ACCEPTED";

  return (
    <Card
      className={cn(
        "overflow-hidden border-2 transition-all",
        isAccepted
          ? "border-success/30 bg-success/5"
          : "border-destructive/30 bg-destructive/5"
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-6 p-6">
          {/* Icon */}
          <div
            className={cn(
              "size-16 rounded-2xl flex items-center justify-center shrink-0",
              isAccepted ? "bg-success/10" : "bg-destructive/10"
            )}
          >
            {isAccepted ? (
              <Shield className="size-8 text-success" />
            ) : (
              <AlertTriangle className="size-8 text-destructive" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isAccepted ? (
                <CheckCircle className="size-5 text-success" />
              ) : (
                <XCircle className="size-5 text-destructive" />
              )}
              <h3
                className={cn(
                  "text-xl font-bold tracking-tight",
                  isAccepted ? "text-success" : "text-destructive"
                )}
              >
                {isAccepted ? "CLAIM APPROVED" : "CLAIM REJECTED"}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isAccepted
                ? "All validation checks passed successfully. The claim has been approved for processing and will be forwarded to the claims department."
                : "One or more validation checks failed. Please review the comparison details below to identify discrepancies."}
            </p>
          </div>

          {/* Status indicator */}
          <div
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold shrink-0",
              isAccepted
                ? "bg-success text-success-foreground"
                : "bg-destructive text-destructive-foreground"
            )}
          >
            {isAccepted ? "Verified" : "Failed"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
