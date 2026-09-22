import type { SceneAnalysis } from "../types/scene";

export type DemoScene = {
  id: string;
  label: string;
  description: string;
  analysis: SceneAnalysis;
};

export const demoScenes: DemoScene[] = [
  {
    id: "immediate-obstacle",
    label: "Immediate obstacle",
    description: "A person is directly in the walking path.",
    analysis: {
      objects: [
        { object: "person", direction: "center", distance: "near", motion: "stationary", confidence: 0.98 },
      ],
    },
  },
  {
    id: "side-hazard",
    label: "Side hazard",
    description: "Stairs appear slightly to the right.",
    analysis: {
      objects: [
        { object: "stairs", direction: "right", distance: "near", motion: "stationary", confidence: 0.97 },
      ],
    },
  },
  {
    id: "clear-path",
    label: "Clear path",
    description: "Background objects do not block the path.",
    analysis: {
      objects: [
        { object: "tree", direction: "left", distance: "far", motion: "stationary", confidence: 0.94 },
        { object: "building", direction: "right", distance: "far", motion: "stationary", confidence: 0.96 },
        { object: "bench", direction: "left", distance: "far", motion: "stationary", confidence: 0.92 },
      ],
    },
  },
  {
    id: "relevance-filter",
    label: "Relevance filter",
    description: "Many objects are present; only the immediate vehicle matters.",
    analysis: {
      objects: [
        { object: "car", direction: "center", distance: "near", motion: "stationary", confidence: 0.96 },
        { object: "tree", direction: "left", distance: "far", motion: "stationary", confidence: 0.95 },
        { object: "building", direction: "right", distance: "far", motion: "stationary", confidence: 0.98 },
        { object: "bench", direction: "right", distance: "far", motion: "stationary", confidence: 0.93 },
        { object: "person", direction: "center", distance: "far", motion: "stationary", confidence: 0.72 },
      ],
    },
  },
];
