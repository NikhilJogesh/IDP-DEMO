import { z } from "zod";

export const directionSchema = z.enum(["left", "center", "right", "unknown"]);
export const distanceSchema = z.enum(["near", "medium", "far", "unknown"]);
export const motionSchema = z.enum(["approaching", "moving_away", "stationary", "unknown"]);

export const sceneObjectSchema = z.object({
  object: z.string().trim().min(1).max(80),
  direction: directionSchema,
  distance: distanceSchema,
  motion: motionSchema,
  confidence: z.number().min(0).max(1),
});

export const sceneAnalysisSchema = z.object({
  objects: z.array(sceneObjectSchema).max(30),
});

export type SceneObject = z.infer<typeof sceneObjectSchema>;
export type SceneAnalysis = z.infer<typeof sceneAnalysisSchema>;
