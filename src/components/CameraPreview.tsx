import { Camera, CameraOff, LoaderCircle } from "lucide-react";

type CameraPreviewProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  status: "unavailable" | "pending" | "denied" | "ready" | "analyzing" | "error";
  error?: string;
};

export function CameraPreview({ videoRef, canvasRef, status, error }: CameraPreviewProps) {
  const ready = status === "ready" || status === "analyzing";
  return (
    <section className="camera-stage" aria-label="Camera preview">
      <video ref={videoRef} className={`camera-stage__video ${ready ? "is-ready" : ""}`} autoPlay muted playsInline aria-label="Live camera preview" />
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <div className="camera-stage__scrim" aria-hidden="true" />
      <div className="camera-stage__crosshair" aria-hidden="true"><span /><span /></div>
      <div className="camera-stage__meta">
        <span className="camera-stage__status">
          {status === "analyzing" ? <LoaderCircle size={15} className="spin" aria-hidden="true" /> : ready ? <Camera size={15} aria-hidden="true" /> : <CameraOff size={15} aria-hidden="true" />}
          {status === "pending" ? "Camera permission pending" : status === "denied" ? "Camera access denied" : status === "unavailable" ? "Camera unavailable" : status === "analyzing" ? "Analyzing frame" : status === "error" ? "Camera error" : "Camera ready"}
        </span>
        <span className="camera-stage__mode">SINGLE FRAME</span>
      </div>
      {(status === "denied" || status === "unavailable" || status === "error") && (
        <div className="camera-stage__message" role="status">
          <strong>{status === "denied" ? "Camera access is blocked." : "Camera is not ready."}</strong>
          <span>{error || "Use Demo Mode to test EDITH’s decision pipeline."}</span>
        </div>
      )}
    </section>
  );
}
