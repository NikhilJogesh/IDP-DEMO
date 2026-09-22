import { sceneAnalysisSchema, type SceneAnalysis } from "../../src/types/scene";
import { AiProviderError, type VisionProvider } from "./provider";

const perceptionInstruction = `You are the perception layer of EDITH, an experimental assistive environmental-awareness system for blind and low-vision pedestrians.

Analyze ONLY the visible scene. Identify environmental entities that may be relevant to a pedestrian. Estimate object category, direction relative to the camera, approximate distance category, whether the object appears stationary, approaching, or moving away, and confidence from 0 to 1.

Do not generate a spoken warning. Do not narrate the entire scene. Do not provide medical advice. Do not identify people by name or identity. Do not perform face recognition. Return ONLY valid JSON matching the requested schema. Focus on objects that could affect immediate pedestrian movement, navigation, or awareness.`;

const sceneJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    objects: {
      type: "array",
      maxItems: 30,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          object: { type: "string" },
          direction: { type: "string", enum: ["left", "center", "right", "unknown"] },
          distance: { type: "string", enum: ["near", "medium", "far", "unknown"] },
          motion: { type: "string", enum: ["approaching", "moving_away", "stationary", "unknown"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["object", "direction", "distance", "motion", "confidence"],
      },
    },
  },
  required: ["objects"],
} as const;

function getConfig() {
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  const provider = process.env.AI_PROVIDER?.trim() || "openai";
  const defaultBaseUrls: Record<string, string> = {
    openai: "https://api.openai.com/v1",
    groq: "https://api.groq.com/openai/v1",
    ollama: "http://127.0.0.1:11434/v1",
  };
  const baseUrl = (process.env.AI_BASE_URL?.trim() || defaultBaseUrls[provider] || "").replace(/\/$/, "");

  if (!model || (provider !== "ollama" && !apiKey)) {
    throw new AiProviderError(provider === "ollama"
      ? "Local AI is not configured. Install a vision model with Ollama and set AI_MODEL."
      : "Live AI is not configured. Add AI_API_KEY and AI_MODEL to the server environment.", "CONFIGURATION");
  }

  if (!defaultBaseUrls[provider]) {
    throw new AiProviderError(`Unsupported AI_PROVIDER \"${provider}\". Use openai, groq, or ollama.`, "CONFIGURATION");
  }

  return { apiKey: apiKey || "ollama", model, baseUrl };
}

function extractMessageContent(payload: unknown): string {
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "object" && part !== null && "text" in part ? String((part as { text: unknown }).text) : ""))
      .join("");
  }
  throw new AiProviderError("The vision provider returned no readable scene content.", "INVALID_RESPONSE");
}

function parseJsonObject(text: string): unknown {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AiProviderError("The vision provider returned malformed JSON.", "INVALID_RESPONSE");
  }
}

export class OpenAiCompatibleVisionProvider implements VisionProvider {
  async analyzeScene(image: string, mimeType: string): Promise<SceneAnalysis> {
    const { apiKey, model, baseUrl } = getConfig();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages: [
            { role: "system", content: perceptionInstruction },
            {
              role: "user",
              content: [
                { type: "text", text: "Return the structured scene analysis for this camera frame." },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "scene_analysis",
              strict: true,
              schema: sceneJsonSchema,
            },
          },
        }),
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const providerMessage = typeof payload === "object" && payload !== null && "error" in payload
          ? JSON.stringify((payload as { error: unknown }).error)
          : `HTTP ${response.status}`;
        throw new AiProviderError(`Vision provider request failed: ${providerMessage}`, "UPSTREAM");
      }

      const parsed = sceneAnalysisSchema.safeParse(parseJsonObject(extractMessageContent(payload)));
      if (!parsed.success) {
        throw new AiProviderError("The vision provider returned a scene that failed validation.", "INVALID_RESPONSE");
      }
      return parsed.data;
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AiProviderError("The vision provider timed out. Try scanning again or use Demo Mode.", "TIMEOUT");
      }
      throw new AiProviderError("The vision provider could not be reached. Try again or use Demo Mode.", "UPSTREAM");
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const visionProvider = new OpenAiCompatibleVisionProvider();
