"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { DataCard } from "@/components/data-card";
import { ComparisonGrid } from "@/components/comparison-grid";
import { ProcessingSteps } from "@/components/processing-steps";
import { DecisionBanner } from "@/components/decision-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  ShieldCheck,
  AlertTriangle,
  Code,
  Sparkles,
  ArrowRight,
} from "lucide-react";
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
      {/* Header with gradient accent */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  ClaimShield
                </h1>
                <p className="text-xs text-muted-foreground">
                  Insurance Validator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Sparkles className="size-3" />
                AI Powered
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="mb-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 text-balance">
              Automated Claim{" "}
              <span className="gradient-text">Verification</span>
            </h2>
            <p className="text-muted-foreground text-balance">
              Upload your documents for instant AI-powered verification using
              Snowflake AI Extract and AWS Bedrock for fraud detection.
            </p>
          </div>
        </section>

        {/* File Upload Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-6 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
              1
            </div>
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
              Upload Documents
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FileUpload
              label="Driver's License"
              description="Government-issued ID"
              icon="dl"
              accept=".jpg,.jpeg,.png,.pdf"
              file={dlFile}
              onFileSelect={setDlFile}
            />
            <FileUpload
              label="Claim Document"
              description="Insurance claim form"
              icon="claim"
              accept=".jpg,.jpeg,.png,.pdf"
              file={claimFile}
              onFileSelect={setClaimFile}
            />
            <FileUpload
              label="Car Image"
              description="Photo of vehicle damage"
              icon="car"
              accept=".jpg,.jpeg,.png"
              file={carFile}
              onFileSelect={setCarFile}
            />
          </div>
        </section>

        {/* Submit Button */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-6 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
              2
            </div>
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
              Run Validation
            </h3>
          </div>
          <Card className="card-glow gradient-border bg-card/80">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-medium text-foreground mb-1">
                    Ready to validate?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {!canSubmit
                      ? "Please upload all three documents to continue"
                      : "All documents uploaded. Click to start AI-powered validation."}
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full md:w-auto min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  onClick={handleValidation}
                  disabled={!canSubmit}
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="text-primary-foreground" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Start Validation
                      <ArrowRight className="size-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-8 border-destructive/50 bg-destructive/10"
          >
            <AlertTriangle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Processing Steps (shown while processing) */}
        {isProcessing && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="size-6 rounded-md bg-primary flex items-center justify-center">
                <Spinner className="size-3 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                Processing
              </h3>
            </div>
            <ProcessingSteps currentStep={currentStep} isComplete={false} />
          </section>
        )}

        {/* Results Section */}
        {result && (
          <div className="flex flex-col gap-8">
            {/* Decision Banner */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="size-6 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  3
                </div>
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                  Validation Result
                </h3>
              </div>
              <DecisionBanner decision={result.decision} />
            </section>

            {/* Comparison Grid */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="size-6 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  4
                </div>
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                  Data Comparison
                </h3>
              </div>
              <ComparisonGrid comparison={result.comparison} />
            </section>

            {/* Processing Steps (collapsed) */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="size-6 rounded-md bg-success flex items-center justify-center text-xs font-semibold text-success-foreground">
                  <ShieldCheck className="size-3" />
                </div>
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                  Processing Complete
                </h3>
              </div>
              <ProcessingSteps currentStep="complete" isComplete={true} />
            </section>

            {/* Extracted Data Cards */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="size-6 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  5
                </div>
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                  Extracted Data
                </h3>
              </div>
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
            <Card className="bg-card/50 border-border/50">
              <CardHeader
                className="cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-lg"
                onClick={() => setShowDebug(!showDebug)}
              >
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Code className="size-4 text-muted-foreground" />
                  Debug Output
                  <span className="text-xs text-muted-foreground ml-auto">
                    {showDebug ? "Click to collapse" : "Click to expand"}
                  </span>
                </CardTitle>
              </CardHeader>
              {showDebug && (
                <CardContent>
                  <pre className="p-4 bg-secondary/50 rounded-lg overflow-auto text-xs font-mono text-muted-foreground">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Powered by Snowflake AI Extract & AWS Bedrock</p>
            <p>Multi-Agent Insurance Validator</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
