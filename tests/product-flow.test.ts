import { describe, expect, it } from "vitest";
import { demoScenes } from "../src/demo/demoScenes";
import { prioritizeScene } from "../src/engine/prioritization";
import { answerEdith } from "../src/lib/askEdith";

describe("EDITH review scenarios use the decision pipeline", () => {
  it("returns one urgent alert for the immediate obstacle", () => {
    const alert = prioritizeScene(demoScenes[0].analysis);
    expect(alert.priority).toBe("urgent");
    expect(alert.spoken_alert).toBe("Person directly ahead. Slow down.");
  });

  it("returns one urgent directional alert for the side hazard", () => {
    const alert = prioritizeScene(demoScenes[1].analysis);
    expect(alert.priority).toBe("urgent");
    expect(alert.direction).toBe("right");
    expect(alert.spoken_alert).toBe("Stairs ahead on your right.");
  });

  it("confirms a clear path without narrating background objects", () => {
    const alert = prioritizeScene(demoScenes[2].analysis);
    expect(alert.priority).toBe("none");
    expect(alert.object).toBe("clear path");
    expect(alert.spoken_alert).toBe("Path ahead appears clear.");
  });

  it("filters the noisy scene down to the relevant vehicle", () => {
    const alert = prioritizeScene(demoScenes[3].analysis);
    expect(alert.priority).toBe("urgent");
    expect(alert.object).toBe("car");
    expect(alert.spoken_alert).not.toMatch(/tree|building|bench|person/);
  });
});

describe("Ask EDITH remains scene-grounded", () => {
  it("uses the latest alert for supported questions", () => {
    const scene = demoScenes[1].analysis;
    const alert = prioritizeScene(scene);
    expect(answerEdith("What's ahead?", scene, alert)).toBe("Stairs ahead on your right.");
    expect(answerEdith("Is the path clear?", scene, alert)).toBe("No. Stairs ahead on your right.");
  });

  it("asks the user to scan before answering", () => {
    expect(answerEdith("What's ahead?", null, null)).toBe("Please scan the scene first.");
  });
});
