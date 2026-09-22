import { Router } from "express";
import { z } from "zod";
import { AiProviderError } from "../ai/provider";
import { visionProvider } from "../ai/visionProvider";

const analyzeRequestSchema = z.object({
  image: z.string().min(100).max(12_000_000),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp)$/i),
});

export const analyzeRouter = Router();

analyzeRouter.post("/analyze", async (request, response) => {
  const parsed = analyzeRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: { code: "INVALID_REQUEST", message: "Provide a supported image frame." } });
    return;
  }

  try {
    const analysis = await visionProvider.analyzeScene(parsed.data.image, parsed.data.mimeType);
    response.json(analysis);
  } catch (error) {
    if (error instanceof AiProviderError) {
      const status = error.code === "CONFIGURATION" ? 503 : error.code === "INVALID_RESPONSE" ? 502 : 502;
      response.status(status).json({ error: { code: error.code, message: error.message } });
      return;
    }
    response.status(500).json({ error: { code: "UNKNOWN", message: "Scene analysis failed. Try again or use Demo Mode." } });
  }
});
