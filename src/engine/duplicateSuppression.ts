import type { Alert } from "../types/alert";

export type DuplicateDecision = {
  suppressed: boolean;
  key: string;
};

export function alertKey(alert: Alert) {
  return [alert.priority, alert.object.toLowerCase().trim(), alert.direction, alert.spoken_alert.toLowerCase().trim()].join("|");
}

export class DuplicateSuppressor {
  private lastKey = "";
  private lastAt = 0;

  constructor(private readonly windowMs = 5000) {}

  shouldSuppress(alert: Alert, now = Date.now()): DuplicateDecision {
    const key = alertKey(alert);
    const suppressed = key === this.lastKey && now - this.lastAt < this.windowMs;
    if (!suppressed) {
      this.lastKey = key;
      this.lastAt = now;
    }
    return { suppressed, key };
  }
}
