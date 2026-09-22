import type { Alert } from "../types/alert";
import type { SceneAnalysis } from "../types/scene";

export function answerEdith(question: string, scene: SceneAnalysis | null, alert: Alert | null) {
  if (!scene || !alert) return "Please scan the scene first.";

  const normalized = question.toLowerCase().replace(/[?!.]/g, "").trim();
  const asksPath = normalized.includes("path") || normalized.includes("clear");
  const asksAhead = normalized.includes("ahead") || normalized.includes("watch") || normalized.includes("matter");

  if (asksPath) {
    return alert.priority === "none" ? "The center path appears clear." : `No. ${alert.spoken_alert}`;
  }
  if (asksAhead || normalized.length > 0) return alert.spoken_alert;
  return "Ask what is ahead, whether the path is clear, or what to watch out for.";
}
