import { z } from "zod";
import { directionSchema } from "./scene";

export const prioritySchema = z.enum(["urgent", "informational", "none"]);

export const alertSchema = z.object({
  priority: prioritySchema,
  object: z.string(),
  direction: directionSchema,
  spoken_alert: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export type Priority = z.infer<typeof prioritySchema>;
export type Alert = z.infer<typeof alertSchema>;

export type AlertHistoryItem = Alert & {
  timestamp: string;
};
