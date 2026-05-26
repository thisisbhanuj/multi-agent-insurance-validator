import { NextRequest, NextResponse } from "next/server";
import { uploadToS3, getFileFromS3 } from "@/lib/s3";
import {
  extractDriverLicense,
  extractClaim,
  getCustomerPolicy,
} from "@/lib/snowflake";
import { analyzeCarImage } from "@/lib/bedrock";
import type {
  ValidationResult,
  DriverLicenseData,
  ClaimData,
  CarAnalysisData,
  ComparisonResult,
} from "@/lib/types";

export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const dlFile = formData.get("dl") as File | null;
    const claimFile = formData.get("claim") as File | null;
    const carFile = formData.get("car") as File | null;

    if (!dlFile || !claimFile || !carFile) {
      return NextResponse.json(
        { success: false, error: "All three files are required" },
        { status: 400 }
      );
    }

    // Step 1: Upload files to S3
    const [dlBuffer, claimBuffer, carBuffer] = await Promise.all([
      dlFile.arrayBuffer().then((buf) => Buffer.from(buf)),
      claimFile.arrayBuffer().then((buf) => Buffer.from(buf)),
      carFile.arrayBuffer().then((buf) => Buffer.from(buf)),
    ]);

    const [dlPath, claimPath, carPath] = await Promise.all([
      uploadToS3(dlBuffer, dlFile.name, "DL", dlFile.type),
      uploadToS3(claimBuffer, claimFile.name, "CLAIMS", claimFile.type),
      uploadToS3(carBuffer, carFile.name, "CAR", carFile.type),
    ]);

    // Give Snowflake time to index the external stage
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 2: Extract Driver License data using Snowflake AI_EXTRACT
    const dlData: DriverLicenseData = await extractDriverLicense(dlPath);

    // Step 3: Extract Claim data using Snowflake AI_EXTRACT
    const claimData: ClaimData = (await extractClaim(claimPath)) as ClaimData;

    // Step 4: Analyze car image using AWS Bedrock
    const carImageBuffer = await getFileFromS3(carPath);
    const carFormat = carFile.name.split(".").pop() || "jpeg";
    const carData: CarAnalysisData = await analyzeCarImage(
      carImageBuffer,
      carFormat
    );

    // Step 5: Get policy data and compare
    const policy = await getCustomerPolicy(claimData.customer_id);

    // Parse incident date
    let incidentDate: Date | null = null;
    try {
      incidentDate = new Date(claimData.incident_date);
    } catch {
      incidentDate = null;
    }

    const policyValid =
      incidentDate !== null && incidentDate <= policy.policy_end;

    // Perform comparisons
    const comparison: ComparisonResult = {
      name: dlData.full_name === claimData.full_name,
      dl: dlData.dl_number === claimData.dl_number,
      vin: claimData.vin === policy.vin,
      color:
        (claimData.vehicle_color || "").toLowerCase().includes(
          carData.color.toLowerCase()
        ) ||
        carData.color.toLowerCase().includes(
          (claimData.vehicle_color || "").toLowerCase()
        ),
      policy_valid: policyValid,
    };

    // Make decision
    const allMatch = Object.values(comparison).every((v) => v === true);
    const decision = allMatch ? "ACCEPTED" : "REJECTED";

    const result: ValidationResult = {
      dl: dlData,
      claim: claimData,
      car: carData,
      comparison,
      decision,
      steps: [
        "uploading",
        "extracting_dl",
        "extracting_claim",
        "analyzing_car",
        "comparing",
        "complete",
      ],
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
