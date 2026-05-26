"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Search } from "lucide-react";
import type { ComparisonResult } from "@/lib/types";

interface ComparisonGridProps {
  comparison: ComparisonResult;
}

const fieldLabels: Record<keyof ComparisonResult, string> = {
  name: "Name",
  dl: "DL Number",
  vin: "VIN",
  color: "Vehicle Color",
  policy_valid: "Policy Valid",
};

export function ComparisonGrid({ comparison }: ComparisonGridProps) {
  const entries = Object.entries(comparison) as [keyof ComparisonResult, boolean][];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="text-primary" />
          Validation Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {entries.map(([field, matches]) => (
            <div
              key={field}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card"
            >
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {fieldLabels[field]}
              </span>
              {matches ? (
                <Badge
                  variant="default"
                  className="gap-1 bg-green-100 text-green-700 hover:bg-green-100"
                >
                  <CheckCircle className="size-3" />
                  Match
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="gap-1"
                >
                  <XCircle className="size-3" />
                  Mismatch
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
