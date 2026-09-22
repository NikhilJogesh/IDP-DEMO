import { useCallback, useEffect, useRef, useState } from "react";
import { AudioLines, BrainCircuit, ChevronRight, Info, LoaderCircle, Radio, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { AlertCard } from "./components/AlertCard";
import { AlertHistory } from "./components/AlertHistory";
import { AskEdith } from "./components/AskEdith";
import { CameraPreview } from "./components/CameraPreview";
import { GuidedTour } from "./components/GuidedTour";
import { PrivacyStatus } from "./components/PrivacyStatus";
import { SiteNav } from "./components/SiteNav";
import { demoScenes } from "./demo/demoScenes";
import { prioritizeScene } from "./engine/prioritization";
import { DuplicateSuppressor } from "./engine/duplicateSuppression";
import { answerEdith } from "./lib/askEdith";
import { analyzeFrame, AnalyzeError } from "./lib/api";
import { loadHistory, saveHistory } from "./lib/history";
import { canSpeak, speakAlert, speakText } from "./lib/speech";
import type { Alert, AlertHistoryItem } from "./types/alert";
import type { SceneAnalysis } from "./types/scene";

type CameraStatus = "unavailable" | "pending" | "denied" | "ready" | "analyzing" | "error";

type AppProps = { onNavigate: (path: "/" | "/about") => void };

function captureFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<{ image: string; mimeType: string }> {
  if (!video.videoWidth || !video.videoHeight) throw new Error("The camera frame is not ready yet.");
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The camera canvas is unavailable.");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not capture the current frame."));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || "");
        const comma = result.indexOf(",");
        resolve({ image: comma >= 0 ? result.slice(comma + 1) : result, mimeType: blob.type || "image/jpeg" });
      };
      reader.onerror = () => reject(new Error("Could not prepare the current frame."));
      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.82);
  });
}

export default function App({ onNavigate }: AppProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const duplicateSuppressor = useRef(new DuplicateSuppressor(5000));
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("pending");
  const [cameraError, setCameraError] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState(demoScenes[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestScene, setLatestScene] = useState<SceneAnalysis | null>(null);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [history, setHistory] = useState<AlertHistoryItem[]>(() => loadHistory());
  const [muted, setMuted] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState("");
  const [speechAvailable] = useState(() => canSpeak());
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus("unavailable");
        setCameraError("This browser does not expose camera access.");
        return;
      }
      setCameraStatus("pending");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setCameraStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "error");
        setCameraError(error instanceof DOMException && error.name === "NotAllowedError" ? "Allow camera access to use Live Mode." : "The camera could not be started.");
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const commitAlert = useCallback((scene: SceneAnalysis, alert: Alert) => {
    setLatestScene(scene);
    setCurrentAlert(alert);
    setAnalysisError("");
    const duplicate = duplicateSuppressor.current.shouldSuppress(alert);
    if (!duplicate.suppressed) {
      speakAlert(alert, muted);
      setHistory((previous) => [{ ...alert, timestamp: new Date().toISOString() }, ...previous].slice(0, 30));
    }
  }, [muted]);

  async function handleScan() {
    setAssistantResponse("");
    setAnalysisError("");
    setIsAnalyzing(true);
    setCameraStatus(isDemoMode ? cameraStatus : "analyzing");
    try {
      if (isDemoMode) {
        const scene = demoScenes.find((item) => item.id === selectedDemoId) || demoScenes[0];
        const alert = prioritizeScene(scene.analysis);
        commitAlert(scene.analysis, alert);
        return;
      }

      if (!videoRef.current || !canvasRef.current) throw new Error("Camera preview is not ready.");
      const frame = await captureFrame(videoRef.current, canvasRef.current);
      const scene = await analyzeFrame(frame.image, frame.mimeType);
      const alert = prioritizeScene(scene);
      commitAlert(scene, alert);
    } catch (error) {
      const message = error instanceof AnalyzeError || error instanceof Error ? error.message : "Scene analysis failed. Use Demo Mode to continue.";
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
      if (!isDemoMode) setCameraStatus((current) => current === "analyzing" ? "ready" : current);
    }
  }

  function handleAsk(question: string) {
    const response = answerEdith(question, latestScene, currentAlert);
    setAssistantResponse(response);
    speakText(response, muted);
  }

  function replayAlert() {
    if (currentAlert) speakAlert(currentAlert, muted);
  }

  const modeLabel = isDemoMode ? "DEMO MODE" : "LIVE MODE";

  return (
    <main className="app-shell">
      <SiteNav active="app" onNavigate={onNavigate} onTour={() => setTourOpen(true)} />
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><AudioLines size={22} /></div>
          <div>
            <p className="brand-name">EDITH</p>
            <p className="brand-subtitle">Environmental awareness, prioritized.</p>
          </div>
        </div>
        <div className="topbar-status" aria-label={`System mode: ${modeLabel}`}>
          <span className={`mode-chip ${isDemoMode ? "mode-chip--demo" : ""}`}><span className="mode-chip__dot" />{modeLabel}</span>
          <span className="system-caption"><ShieldCheck size={15} aria-hidden="true" /> Experimental prototype</span>
        </div>
      </header>

      <section className="hero-intro" data-tour="hero">
        <div>
          <span className="eyebrow">Risk-prioritized environmental awareness</span>
          <h1>Know what matters <em>right now.</em></h1>
        </div>
        <p>EDITH filters the scene before it speaks. Scan once, and get the shortest useful guidance instead of a list of everything in view.</p>
      </section>

      <div className="console-grid">
        <section className="left-column">
          <div data-tour="camera"><CameraPreview videoRef={videoRef} canvasRef={canvasRef} status={cameraStatus} error={cameraError} /></div>
          <div className="scan-toolbar panel" data-tour="scan">
            <div className="scan-toolbar__copy" data-tour="scene-analysis">
              <div className="scan-toolbar__title"><ScanLine size={18} aria-hidden="true" /><strong>{isDemoMode ? "Run a prepared scene" : "Scan the environment"}</strong></div>
              <span>{isDemoMode ? "The prepared scene uses the same perception-to-alert engine." : "One frame. One decision. One useful alert."}</span>
            </div>
            <button type="button" className="button button--primary button--scan" onClick={() => void handleScan()} disabled={isAnalyzing || (!isDemoMode && cameraStatus !== "ready")}>
              {isAnalyzing ? <LoaderCircle size={18} className="spin" aria-hidden="true" /> : <Radio size={18} aria-hidden="true" />}
              {isAnalyzing ? "Analyzing…" : isDemoMode ? "Run scenario" : "Scan"}
            </button>
          </div>

          {analysisError && <div className="error-banner" role="alert"><Info size={18} aria-hidden="true" /><div><strong>Live analysis unavailable.</strong><span>{analysisError}</span></div><button type="button" onClick={() => setIsDemoMode(true)}>Use Demo Mode</button></div>}

          <section className="panel demo-panel" aria-labelledby="demo-title" data-tour="demo-mode">
            <div className="panel-heading">
              <div><span className="eyebrow">Controlled verification</span><h2 id="demo-title">Demo Mode</h2></div>
              <label className="switch-label"><span>Use prepared scenes</span><input type="checkbox" checked={isDemoMode} onChange={(event) => setIsDemoMode(event.target.checked)} /><span className="switch" aria-hidden="true" /></label>
            </div>
            <p className="panel-copy">Offline mode sends structured scene objects through the same prioritization, alert, speech, and history pipeline as Live Mode.</p>
            <div className="demo-scenes" aria-label="Choose a demonstration scenario">
              {demoScenes.map((scene, index) => (
                <button type="button" key={scene.id} className={`demo-scene ${selectedDemoId === scene.id ? "is-selected" : ""}`} onClick={() => { setSelectedDemoId(scene.id); setIsDemoMode(true); }}>
                  <span className="demo-scene__number">0{index + 1}</span>
                  <span><strong>{scene.label}</strong><small>{scene.description}</small></span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        </section>

        <aside className="right-column">
          <div data-tour="decision-engine"><AlertCard alert={currentAlert} muted={muted} onReplay={replayAlert} onToggleMute={() => setMuted((value) => !value)} /></div>
          <div data-tour="ask-edith"><AskEdith onAsk={handleAsk} /></div>
          {assistantResponse && <div className="assistant-response" role="status"><Sparkles size={17} aria-hidden="true" /><span>{assistantResponse}</span></div>}
          <div data-tour="history"><AlertHistory history={history} onClear={() => setHistory([])} /></div>
          <div data-tour="privacy"><PrivacyStatus /></div>
        </aside>
      </div>

      <footer className="footer-note" data-tour="limitations">
        <div data-tour="perception-status"><BrainCircuit size={15} aria-hidden="true" /><span>Perception ≠ decision. EDITH’s relevance engine chooses what deserves attention.</span></div>
        <span>{speechAvailable ? "Speech output available" : "Speech output unavailable"}</span>
      </footer>
      <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </main>
  );
}
