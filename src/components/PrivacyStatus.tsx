import { LockKeyhole } from "lucide-react";

export function PrivacyStatus() {
  return (
    <section className="panel privacy-panel" aria-labelledby="privacy-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Trust boundary</span>
          <h2 id="privacy-title">Privacy status</h2>
        </div>
        <LockKeyhole size={18} aria-hidden="true" />
      </div>
      <div className="privacy-grid">
        <span><i className="status-dot status-dot--active" />Camera <strong>ACTIVE</strong></span>
        <span><i className="status-dot" />Recording <strong>OFF</strong></span>
        <span><i className="status-dot" />Frame storage <strong>OFF</strong></span>
      </div>
      <p>Frames are analyzed temporarily for this experimental prototype and are not intentionally stored by the application.</p>
    </section>
  );
}
