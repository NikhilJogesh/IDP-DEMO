import { AlertTriangle, CheckCircle2, Info, Volume2, VolumeX } from "lucide-react";
import type { Alert } from "../types/alert";
import { AttentionRail } from "./AttentionRail";

type AlertCardProps = {
  alert: Alert | null;
  muted: boolean;
  onReplay: () => void;
  onToggleMute: () => void;
};

const priorityCopy = {
  urgent: "Immediate attention",
  informational: "Useful context",
  none: "No priority event",
};

export function AlertCard({ alert, muted, onReplay, onToggleMute }: AlertCardProps) {
  const current = alert || {
    priority: "none" as const,
    object: "waiting for scan",
    direction: "unknown" as const,
    spoken_alert: "Scan the scene to find what matters right now.",
    confidence: 0,
  };
  const Icon = current.priority === "urgent" ? AlertTriangle : current.priority === "informational" ? Info : CheckCircle2;

  return (
    <section className={`panel alert-card alert-card--${current.priority}`} aria-labelledby="current-alert-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Current alert</span>
          <h2 id="current-alert-title">One thing to know</h2>
        </div>
        <span className="alert-card__state"><Icon size={16} aria-hidden="true" /> {priorityCopy[current.priority]}</span>
      </div>
      <div className="alert-card__main" aria-live="polite" aria-atomic="true">
        <div className="alert-card__facts">
          <span className={`priority-badge priority-badge--${current.priority}`}>{current.priority}</span>
          <span className="fact"><span className="eyebrow">Object</span><strong>{current.object}</strong></span>
          <span className="fact"><span className="eyebrow">Direction</span><strong>{current.direction}</strong></span>
        </div>
        <p className="alert-card__message">“{current.spoken_alert}”</p>
      </div>
      <AttentionRail direction={current.direction} />
      <div className="alert-card__actions">
        <button type="button" className="button button--secondary" onClick={onReplay} disabled={!alert}>
          <Volume2 size={17} aria-hidden="true" /> Replay
        </button>
        <button type="button" className={`button button--secondary ${muted ? "is-active" : ""}`} onClick={onToggleMute} aria-pressed={muted}>
          {muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />} {muted ? "Muted" : "Mute"}
        </button>
      </div>
    </section>
  );
}
