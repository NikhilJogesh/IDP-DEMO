import type { Alert } from "../types/alert";
import type { SceneAnalysis, SceneObject } from "../types/scene";
import { generateAlert } from "./alertGenerator";

const normalize = (value: string) => value.toLowerCase().trim();

const matches = (object: string, words: string[]) => {
  const normalized = normalize(object);
  return words.some((word) => normalized.includes(word));
};

const isStairsOrCurb = (object: string) => matches(object, ["stair", "step", "curb", "kerb"]);
const isPerson = (object: string) => matches(object, ["person", "pedestrian", "human"]);
const isVehicle = (object: string) => matches(object, ["vehicle", "car", "truck", "bus", "bike", "bicycle", "motorcycle"]);
const isSign = (object: string) => matches(object, ["sign", "notice", "board"]);
const isNonBlocking = (object: string) => matches(object, ["tree", "building", "bench", "wall", "sky", "background"]);
const isGenericObstacle = (object: string) => matches(object, ["obstacle", "object", "barrier", "pole", "box", "cone"]);

const distanceWeight: Record<SceneObject["distance"], number> = {
  near: 4,
  medium: 2,
  far: 0,
  unknown: 1,
};

const directionWeight: Record<SceneObject["direction"], number> = {
  center: 4,
  left: 2,
  right: 2,
  unknown: 1,
};

function scoreObject(item: SceneObject): number {
  const near = item.distance === "near";
  const center = item.direction === "center";
  const approaching = item.motion === "approaching";
  const relevantCategory = isStairsOrCurb(item.object) || isPerson(item.object) || isVehicle(item.object) || isGenericObstacle(item.object);

  let score = distanceWeight[item.distance] + directionWeight[item.direction];
  score += Math.round(item.confidence * 3);
  if (relevantCategory) score += 2;
  if (center) score += 2;
  if (approaching) score += 5;
  if (near && center) score += 4;
  if (isNonBlocking(item.object) && !near) score -= 6;
  if (isSign(item.object)) score -= 1;

  return score;
}

function isUrgent(item: SceneObject) {
  const nearCenter = item.distance === "near" && item.direction === "center";
  const approachingThreat = item.motion === "approaching" && (isPerson(item.object) || isVehicle(item.object));
  const nearHazard = (nearCenter && (isPerson(item.object) || isVehicle(item.object) || isGenericObstacle(item.object)))
    || (item.distance === "near" && isStairsOrCurb(item.object));
  return nearHazard || approachingThreat;
}

function isInformational(item: SceneObject) {
  return isSign(item.object) && (item.distance === "medium" || item.distance === "far") && item.direction !== "center";
}

export function prioritizeScene(scene: SceneAnalysis): Alert {
  const candidates = scene.objects
    .filter((item) => item.confidence >= 0.35)
    .filter((item) => !isNonBlocking(item.object) || item.distance === "near")
    .sort((a, b) => scoreObject(b) - scoreObject(a));

  const selected = candidates[0];
  if (!selected || (scoreObject(selected) < 7 && !isInformational(selected))) {
    return generateAlert(undefined);
  }

  const priority = isUrgent(selected) ? "urgent" : isInformational(selected) ? "informational" : "none";
  if (priority === "none") return generateAlert(undefined);
  return generateAlert({ ...selected, priority });
}

export type PrioritizedSceneObject = SceneObject & { priority: Exclude<Alert["priority"], "none"> };
