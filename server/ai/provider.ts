import type { SceneAnalysis } from "../../src/types/scene";

export type VisionProvider = {
  analyzeScene(image: string, mimeType: string): Promise<SceneAnalysis>;
};

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly code: "CONFIGURATION" | "UPSTREAM" | "INVALID_RESPONSE" | "TIMEOUT",
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}
