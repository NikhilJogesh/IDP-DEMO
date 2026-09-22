import { Compass } from "lucide-react";
import type { Alert } from "../types/alert";

type AttentionRailProps = {
  direction: Alert["direction"];
};

const directions = ["left", "center", "right"] as const;

export function AttentionRail({ direction }: AttentionRailProps) {
  return (
    <div className="attention-rail" aria-label={`Attention direction: ${direction}`}>
      <div className="attention-rail__header">
        <span className="eyebrow">Attention rail</span>
        <Compass size={16} aria-hidden="true" />
      </div>
      <div className="attention-rail__track" role="img" aria-label={`Current alert direction is ${direction}`}>
        {directions.map((item) => (
          <div className={`attention-rail__slot ${direction === item ? "is-active" : ""}`} key={item}>
            <span className="attention-rail__marker" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
