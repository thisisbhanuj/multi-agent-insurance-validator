"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import type { WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProcessingStepsProps {
  currentStep: WorkflowStep;
  isComplete: boolean;
}

const steps: { key: WorkflowStep; label: string; description: string }[] = [
  {
    key: "uploading",
    label: "Upload",
    description: "Uploading documents to S3",
  },
  {
    key: "extracting_dl",
    label: "License",
    description: "Extracting driver license data",
  },
  {
    key: "extracting_claim",
    label: "Claim",
    description: "Extracting claim form data",
  },
  {
    key: "analyzing_car",
    label: "Analysis",
    description: "Analyzing car damage with AI",
  },
  { key: "comparing", label: "Compare", description: "Comparing data points" },
  {
    key: "complete",
    label: "Complete",
    description: "Validation finished",
  },
];

function getStepIndex(step: WorkflowStep): number {
  return steps.findIndex((s) => s.key === step);
}

export function ProcessingSteps({
  currentStep,
  isComplete,
}: ProcessingStepsProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <Card className="card-glow gradient-border bg-card/80 overflow-hidden">
      <CardContent className="p-0">
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: isComplete
                ? "100%"
                : `${(currentIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep && !isComplete;
              const isDone = index < currentIndex || isComplete;

              return (
                <div key={step.key} className="flex flex-col items-center gap-2">
                  {/* Icon */}
                  <div
                    className={cn(
                      "size-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isDone && "bg-success/10",
                      isActive && "bg-primary/10",
                      !isDone && !isActive && "bg-secondary"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle className="size-5 text-success" />
                    ) : isActive ? (
                      <Loader2 className="size-5 text-primary animate-spin" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isDone && "text-success",
                      isActive && "text-primary",
                      !isDone && !isActive && "text-muted-foreground/50"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current step description */}
          {!isComplete && (
            <div className="mt-4 pt-4 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                {steps[currentIndex]?.description || "Processing..."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
