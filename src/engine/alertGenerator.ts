import type { Priority, Alert } from "../types/alert";
import type { SceneObject } from "../types/scene";

type SelectedObject = SceneObject & { priority: Exclude<Priority, "none"> };

function directionPhrase(direction: SceneObject["direction"]) {
  if (direction === "center") return "directly ahead";
  if (direction === "left") return "on your left";
  if (direction === "right") return "on your right";
  return "nearby";
}

function objectMatches(object: string, words: string[]) {
  const normalized = object.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

export function generateAlert(selected?: SelectedObject): Alert {
  if (!selected) {
    return {
      priority: "none",
      object: "clear path",
      direction: "center",
      spoken_alert: "Path ahead appears clear.",
      confidence: 1,
    };
  }

  const phrase = directionPhrase(selected.direction);
  const object = selected.object.toLowerCase();
  let spokenAlert: string;

  if (objectMatches(object, ["stair", "step", "curb", "kerb"])) {
    spokenAlert = `Stairs ahead ${selected.direction === "center" ? "directly ahead" : phrase}.`;
  } else if (objectMatches(object, ["vehicle", "car", "truck", "bus", "bike", "bicycle", "motorcycle"])) {
    spokenAlert = selected.motion === "approaching" ? `Vehicle approaching ${phrase}.` : `Vehicle ${phrase}. Slow down.`;
  } else if (objectMatches(object, ["person", "pedestrian", "human"])) {
    spokenAlert = `Person ${phrase}. ${selected.priority === "urgent" ? "Slow down." : "Stay aware."}`;
  } else if (objectMatches(object, ["sign", "notice", "board"])) {
    spokenAlert = `Sign ahead ${phrase}.`;
  } else {
    spokenAlert = `${selected.object} ${phrase}.`;
  }

  return {
    priority: selected.priority,
    object: selected.object,
    direction: selected.direction,
    spoken_alert: spokenAlert,
    confidence: selected.confidence,
  };
}
