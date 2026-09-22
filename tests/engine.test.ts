import { describe, expect, it } from "vitest";
import { generateAlert } from "../src/engine/alertGenerator";
import { DuplicateSuppressor } from "../src/engine/duplicateSuppression";
import { prioritizeScene } from "../src/engine/prioritization";
import type { SceneAnalysis } from "../src/types/scene";

describe("EDITH prioritization engine", () => {
  it("prioritizes a near person in the center as urgent", () => {
    const result = prioritizeScene({ objects: [{ object: "person", direction: "center", distance: "near", motion: "stationary", confidence: 0.98 }] });
    expect(result.priority).toBe("urgent");
    expect(result.spoken_alert).toBe("Person directly ahead. Slow down.");
  });

  it("prioritizes stairs on the right as urgent", () => {
    const result = prioritizeScene({ objects: [{ object: "stairs", direction: "right", distance: "near", motion: "stationary", confidence: 0.97 }] });
    expect(result.priority).toBe("urgent");
    expect(result.spoken_alert).toBe("Stairs ahead on your right.");
  });

  it("prioritizes an approaching vehicle", () => {
    const result = prioritizeScene({ objects: [{ object: "vehicle", direction: "left", distance: "medium", motion: "approaching", confidence: 0.9 }] });
    expect(result.priority).toBe("urgent");
    expect(result.spoken_alert).toBe("Vehicle approaching on your left.");
  });

  it("returns none for a clear path with distant background objects", () => {
    const result = prioritizeScene({
      objects: [
        { object: "tree", direction: "left", distance: "far", motion: "stationary", confidence: 0.94 },
        { object: "building", direction: "right", distance: "far", motion: "stationary", confidence: 0.98 },
        { object: "bench", direction: "left", distance: "far", motion: "stationary", confidence: 0.91 },
      ],
    });
    expect(result.priority).toBe("none");
    expect(result.spoken_alert).toBe("Path ahead appears clear.");
  });

  it("selects only the relevant object from a noisy scene", () => {
    const scene: SceneAnalysis = {
      objects: [
        { object: "car", direction: "center", distance: "near", motion: "stationary", confidence: 0.96 },
        { object: "tree", direction: "left", distance: "far", motion: "stationary", confidence: 0.95 },
        { object: "building", direction: "right", distance: "far", motion: "stationary", confidence: 0.98 },
        { object: "bench", direction: "right", distance: "far", motion: "stationary", confidence: 0.93 },
        { object: "person", direction: "center", distance: "far", motion: "stationary", confidence: 0.72 },
      ],
    };
    const result = prioritizeScene(scene);
    expect(result.priority).toBe("urgent");
    expect(result.object).toBe("car");
    expect(result.spoken_alert).toBe("Vehicle directly ahead. Slow down.");
    expect(result.spoken_alert).not.toContain("tree");
    expect(result.spoken_alert).not.toContain("building");
  });

  it("generates informational output for a side sign", () => {
    const result = prioritizeScene({ objects: [{ object: "sign", direction: "right", distance: "medium", motion: "stationary", confidence: 0.9 }] });
    expect(result.priority).toBe("informational");
    expect(result.spoken_alert).toBe("Sign ahead on your right.");
  });
});

describe("alert generation and duplicate suppression", () => {
  it("generates a clear path alert when there is no selected object", () => {
    expect(generateAlert().spoken_alert).toBe("Path ahead appears clear.");
  });

  it("suppresses identical alerts within the active window", () => {
    const suppressor = new DuplicateSuppressor(5000);
    const alert = generateAlert({ object: "person", direction: "center", distance: "near", motion: "stationary", confidence: 0.98, priority: "urgent" });
    expect(suppressor.shouldSuppress(alert, 1_000).suppressed).toBe(false);
    expect(suppressor.shouldSuppress(alert, 4_000).suppressed).toBe(true);
    expect(suppressor.shouldSuppress(alert, 7_000).suppressed).toBe(false);
  });
});
