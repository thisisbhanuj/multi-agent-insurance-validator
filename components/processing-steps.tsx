"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Loader2, Settings } from "lucide-react";
import type { WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProcessingStepsProps {
  currentStep: WorkflowStep;
  isComplete: boolean;
}

const steps: { key: WorkflowStep; label: string }[] = [
  { key: "uploading", label: "Uploading Documents" },
  { key: "extracting_dl", label: "Extracting Driver License" },
  { key: "extracting_claim", label: "Extracting Claim Data" },
  { key: "analyzing_car", label: "Analyzing Car Image" },
  { key: "comparing", label: "Comparing Data" },
  { key: "complete", label: "Validation Complete" },
];

function getStepIndex(step: WorkflowStep): number {
  return steps.findIndex((s) => s.key === step);
}

export function ProcessingSteps({
  currentStep,
  isComplete,
}: ProcessingStepsProps) {
  const currentIndex = getStepIndex(currentStep);
  const progressPercent = isComplete
    ? 100
    : Math.round((currentIndex / (steps.length - 1)) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="text-primary" />
          Processing Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex flex-col gap-2">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep && !isComplete;
            const isDone = index < currentIndex || isComplete;

            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md transition-colors",
                  isActive && "bg-primary/10",
                  isDone && "text-muted-foreground"
                )}
              >
                {isDone ? (
                  <CheckCircle className="size-4 text-green-500 shrink-0" />
                ) : isActive ? (
                  <Loader2 className="size-4 text-primary animate-spin shrink-0" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/50 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    isActive && "font-medium text-foreground",
                    isDone && "line-through"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
