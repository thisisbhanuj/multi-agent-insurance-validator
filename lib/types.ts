// Driver License extracted data
export interface DriverLicenseData {
  full_name: string;
  dl_number: string;
  date_of_birth: string;
  address: string;
}

// Claim form extracted data
export interface ClaimData {
  customer_id: string;
  full_name: string;
  dl_number: string;
  incident_date: string;
  vin: string;
  vehicle: string;
  description: string;
  vehicle_color?: string;
}

// Car image analysis result
export interface CarAnalysisData {
  color: string;
  damage?: string;
  severity?: string;
}

// Comparison results
export interface ComparisonResult {
  name: boolean;
  dl: boolean;
  vin: boolean;
  color: boolean;
  policy_valid: boolean;
}

// Workflow step for progress tracking
export type WorkflowStep =
  | "uploading"
  | "extracting_dl"
  | "extracting_claim"
  | "analyzing_car"
  | "comparing"
  | "complete"
  | "error";

// Full validation result
export interface ValidationResult {
  dl: DriverLicenseData;
  claim: ClaimData;
  car: CarAnalysisData;
  comparison: ComparisonResult;
  decision: "ACCEPTED" | "REJECTED";
  steps: WorkflowStep[];
}

// API request/response types
export interface ValidationRequest {
  dlFile: File;
  claimFile: File;
  carFile: File;
}

export interface ValidationResponse {
  success: boolean;
  data?: ValidationResult;
  error?: string;
  currentStep?: WorkflowStep;
}

// Progress update for streaming
export interface ProgressUpdate {
  step: WorkflowStep;
  message: string;
  data?: Partial<ValidationResult>;
}
