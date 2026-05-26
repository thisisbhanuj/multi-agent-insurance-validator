"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, GitCompare } from "lucide-react";
import type { ComparisonResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ComparisonGridProps {
  comparison: ComparisonResult;
}

const fieldLabels: Record<keyof ComparisonResult, string> = {
  name: "Name",
  dl: "DL Number",
  vin: "VIN",
  color: "Color",
  policy_valid: "Policy",
};

export function ComparisonGrid({ comparison }: ComparisonGridProps) {
  const entries = Object.entries(comparison) as [
    keyof ComparisonResult,
    boolean
  ][];
  const matchCount = entries.filter(([, matches]) => matches).length;
  const totalCount = entries.length;

  return (
    <Card className="card-glow gradient-border bg-card/80">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <GitCompare className="size-4 text-primary" />
            </div>
            Validation Breakdown
          </CardTitle>
          <span
            className={cn(
              "text-sm font-mono px-2.5 py-1 rounded-full",
              matchCount === totalCount
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {matchCount}/{totalCount} passed
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {entries.map(([field, matches]) => (
            <div
              key={field}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                matches
                  ? "border-success/20 bg-success/5"
                  : "border-destructive/20 bg-destructive/5"
              )}
            >
              <div
                className={cn(
                  "size-10 rounded-full flex items-center justify-center",
                  matches ? "bg-success/10" : "bg-destructive/10"
                )}
              >
                {matches ? (
                  <CheckCircle className="size-5 text-success" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                {fieldLabels[field]}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  matches ? "text-success" : "text-destructive"
                )}
              >
                {matches ? "Match" : "Mismatch"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
