import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MODEL_ID = process.env.AWS_MODEL_ID || "amazon.nova-lite-v1:0";

export interface CarAnalysis {
  color: string;
  damage?: string;
  severity?: string;
}

export async function analyzeCarImage(
  imageBuffer: Buffer,
  imageFormat: string
): Promise<CarAnalysis> {
  const base64Image = imageBuffer.toString("base64");

  // Normalize format for Bedrock
  const format = imageFormat.toLowerCase().replace("jpg", "jpeg");

  const body = {
    schemaVersion: "messages-v1",
    messages: [
      {
        role: "user",
        content: [
          {
            image: {
              format,
              source: { bytes: base64Image },
            },
          },
          {
            text: "Analyze this car image. Return ONLY a JSON object with these fields: {color: string (the car's color), damage: string (description of any visible damage), severity: string (low/medium/high)}. If you cannot determine something, use 'unknown'.",
          },
        ],
      },
    ],
  };

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify(body),
      contentType: "application/json",
      accept: "application/json",
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Extract text from response
    const text = responseBody.output?.message?.content?.[0]?.text || "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        color: parsed.color || "unknown",
        damage: parsed.damage || "unknown",
        severity: parsed.severity || "unknown",
      };
    }

    return { color: "unknown", damage: "unknown", severity: "unknown" };
  } catch (error) {
    console.error("Bedrock analysis error:", error);
    return { color: "unknown", damage: "unknown", severity: "unknown" };
  }
}
