import { sceneAnalysisSchema, type SceneAnalysis } from "../types/scene";

export class AnalyzeError extends Error {
  constructor(message: string, public readonly code = "ANALYZE_ERROR") {
    super(message);
    this.name = "AnalyzeError";
  }
}

export async function analyzeFrame(image: string, mimeType: string, signal?: AbortSignal): Promise<SceneAnalysis> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, mimeType }),
    signal,
  }).catch(() => {
    throw new AnalyzeError("The EDITH server could not be reached. Start the API or switch to Demo Mode.", "NETWORK");
  });

  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null && "error" in payload
      ? String(((payload as { error?: { message?: unknown } }).error?.message) || "Scene analysis failed.")
      : "Scene analysis failed.";
    throw new AnalyzeError(message, typeof payload === "object" && payload !== null && "error" in payload
      ? String(((payload as { error?: { code?: unknown } }).error?.code) || "API_ERROR")
      : "API_ERROR");
  }

  const parsed = sceneAnalysisSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AnalyzeError("The AI returned an invalid scene structure. Try again or use Demo Mode.", "INVALID_RESPONSE");
  }
  return parsed.data;
}
