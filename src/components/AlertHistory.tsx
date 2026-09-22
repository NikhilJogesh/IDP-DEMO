import { Clock3, Trash2 } from "lucide-react";
import type { AlertHistoryItem } from "../types/alert";

type AlertHistoryProps = {
  history: AlertHistoryItem[];
  onClear: () => void;
};

export function AlertHistory({ history, onClear }: AlertHistoryProps) {
  return (
    <section className="panel history-panel" aria-labelledby="history-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Local memory</span>
          <h2 id="history-title">Recent alerts</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClear} disabled={history.length === 0} aria-label="Clear alert history" title="Clear alert history">
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
      {history.length === 0 ? (
        <div className="empty-state"><Clock3 size={18} aria-hidden="true" /><span>Scans will appear here. Frames are never stored.</span></div>
      ) : (
        <ol className="history-list">
          {history.map((item, index) => (
            <li className="history-item" key={`${item.timestamp}-${index}`}>
              <div className="history-item__topline">
                <span className={`priority-badge priority-badge--${item.priority}`}>{item.priority}</span>
                <time dateTime={item.timestamp}>{new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(item.timestamp))}</time>
              </div>
              <div className="history-item__detail"><strong>{item.object}</strong><span>{item.direction}</span></div>
              <p>{item.spoken_alert}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
