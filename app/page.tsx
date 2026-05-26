"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { DataCard } from "@/components/data-card";
import { ComparisonGrid } from "@/components/comparison-grid";
import { ProcessingSteps } from "@/components/processing-steps";
import { DecisionBanner } from "@/components/decision-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheck, AlertTriangle, Code } from "lucide-react";
import type { ValidationResult, WorkflowStep } from "@/lib/types";

export default function Home() {
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [claimFile, setClaimFile] = useState<File | null>(null);
  const [carFile, setCarFile] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("uploading");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const canSubmit = dlFile && claimFile && carFile && !isProcessing;

  async function handleValidation() {
    if (!dlFile || !claimFile || !carFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setCurrentStep("uploading");

    try {
      const formData = new FormData();
      formData.append("dl", dlFile);
      formData.append("claim", claimFile);
      formData.append("car", carFile);

      // Simulate step progression for UX
      const stepProgression: WorkflowStep[] = [
        "uploading",
        "extracting_dl",
        "extracting_claim",
        "analyzing_car",
        "comparing",
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < stepProgression.length - 1) {
          stepIndex++;
          setCurrentStep(stepProgression[stepIndex]);
        }
      }, 3000);

      const response = await fetch("/api/validate", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Validation failed");
      }

      setResult(data.data);
      setCurrentStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCurrentStep("error");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Vehicle Insurance Claim Validator
            </h1>
          </div>
          <p className="text-muted-foreground">
            Automated Document Verification & Fraud Detection powered by
            Snowflake AI and AWS Bedrock
          </p>
        </div>

        {/* File Upload Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Upload Documents
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <FileUpload
              label="Driver&apos;s License"
              icon="dl"
              accept=".jpg,.jpeg,.png,.pdf"
              file={dlFile}
              onFileSelect={setDlFile}
            />
            <FileUpload
              label="Claim Document"
              icon="claim"
              accept=".jpg,.jpeg,.png,.pdf"
              file={claimFile}
              onFileSelect={setClaimFile}
            />
            <FileUpload
              label="Car Image"
              icon="car"
              accept=".jpg,.jpeg,.png"
              file={carFile}
              onFileSelect={setCarFile}
            />
          </div>
        </section>

        {/* Submit Button */}
        <div className="mb-8">
          <Button
            size="lg"
            className="w-full"
            onClick={handleValidation}
            disabled={!canSubmit}
          >
            {isProcessing ? (
              <>
                <Spinner className="text-primary-foreground" />
                Processing Claim...
              </>
            ) : (
              "Run Validation"
            )}
          </Button>
          {!dlFile || !claimFile || !carFile ? (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please upload all three documents to continue
            </p>
          ) : null}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Processing Steps (shown while processing) */}
        {isProcessing && (
          <div className="mb-8">
            <ProcessingSteps currentStep={currentStep} isComplete={false} />
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="flex flex-col gap-6">
            <Separator />

            {/* Decision Banner */}
            <DecisionBanner decision={result.decision} />

            {/* Comparison Grid */}
            <ComparisonGrid comparison={result.comparison} />

            {/* Processing Steps (collapsed) */}
            <ProcessingSteps currentStep="complete" isComplete={true} />

            {/* Extracted Data Cards */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Extracted Data
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <DataCard
                  title="Driver License"
                  icon="dl"
                  data={result.dl}
                  fields={[
                    { label: "Name", key: "full_name" },
                    { label: "DL Number", key: "dl_number" },
                    { label: "DOB", key: "date_of_birth" },
                    { label: "Address", key: "address" },
                  ]}
                />
                <DataCard
                  title="Claim Document"
                  icon="claim"
                  data={result.claim}
                  fields={[
                    { label: "Customer ID", key: "customer_id" },
                    { label: "Name", key: "full_name" },
                    { label: "DL Number", key: "dl_number" },
                    { label: "Incident Date", key: "incident_date" },
                    { label: "VIN", key: "vin" },
                    { label: "Vehicle", key: "vehicle" },
                  ]}
                />
                <DataCard
                  title="Car Analysis"
                  icon="car"
                  data={result.car}
                  fields={[
                    { label: "Color", key: "color" },
                    { label: "Damage", key: "damage" },
                    { label: "Severity", key: "severity" },
                  ]}
                />
              </div>
            </section>

            {/* Debug Output */}
            <Card>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setShowDebug(!showDebug)}
              >
                <CardTitle className="flex items-center gap-2 text-base">
                  <Code className="size-4 text-muted-foreground" />
                  Debug Output
                  <span className="text-xs text-muted-foreground ml-auto">
                    {showDebug ? "Click to collapse" : "Click to expand"}
                  </span>
                </CardTitle>
              </CardHeader>
              {showDebug && (
                <CardContent>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
