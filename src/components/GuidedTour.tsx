import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type TourStep = {
  id: string;
  target: string;
  title: string;
  description: string;
  position?: "top" | "right" | "bottom" | "left";
};

const TOUR_STEPS: TourStep[] = [
  { id: "camera", target: '[data-tour="camera"]', title: "Start with one frame", description: "EDITH begins with a single camera frame. The prototype does not continuously stream frames to the AI model.", position: "right" },
  { id: "scan", target: '[data-tour="scan"]', title: "Scan the scene", description: "Press Scan to capture the current scene and send one frame to the perception layer.", position: "bottom" },
  { id: "perception", target: '[data-tour="perception-status"]', title: "Perception stays focused", description: "A real multimodal vision model analyzes the frame and identifies relevant environmental entities.", position: "top" },
  { id: "scene", target: '[data-tour="scene-analysis"]', title: "Structured scene analysis", description: "The model does not decide what to say. It produces structured scene information: object, direction, distance, motion, and confidence.", position: "top" },
  { id: "decision", target: '[data-tour="decision-engine"]', title: "Decision happens locally", description: "EDITH’s deterministic engine evaluates distance, direction, motion, object type, confidence, and path relevance.", position: "left" },
  { id: "alert", target: '[data-tour="current-alert"]', title: "One useful alert", description: "EDITH intentionally produces ONE primary alert instead of narrating every detected object.", position: "left" },
  { id: "direction", target: '[data-tour="attention-rail"]', title: "Direction is explicit", description: "The Attention Rail communicates LEFT, CENTER, and RIGHT using position and text — not color alone.", position: "left" },
  { id: "speech", target: '[data-tour="speech-controls"]', title: "Audio is the product", description: "The alert can be spoken through the browser’s speech synthesis system. Replay or mute it from the control surface.", position: "left" },
  { id: "ask", target: '[data-tour="ask-edith"]', title: "Ask, but stay grounded", description: "Ask EDITH is grounded in the latest scene. It is not a general-purpose chatbot.", position: "left" },
  { id: "history", target: '[data-tour="history"]', title: "Keep a local trail", description: "Recent alerts provide local session history so the user can review what EDITH has communicated. Camera frames are never stored.", position: "left" },
  { id: "demo", target: '[data-tour="demo-mode"]', title: "Repeatable Demo Mode", description: "Demo Mode uses prepared SceneAnalysis inputs but passes them through the SAME prioritization and alert-generation logic used by the live prototype.", position: "top" },
  { id: "privacy", target: '[data-tour="privacy"]', title: "Privacy stays visible", description: "The prototype exposes its privacy state: camera active, recording off, frame storage off.", position: "left" },
  { id: "limits", target: '[data-tour="limitations"]', title: "Know the limits", description: "EDITH is an experimental prototype. It is not safety-certified and does not guarantee detection.", position: "top" },
  { id: "finish", target: '[data-tour="perception-status"]', title: "See less. Understand more.", description: "EDITH is built around one principle: filter the scene, decide what matters, and communicate the shortest useful guidance.", position: "top" },
];

type GuidedTourProps = { open: boolean; onClose: () => void };

type Rect = { top: number; left: number; width: number; height: number };

export function GuidedTour({ open, onClose }: GuidedTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [availableSteps, setAvailableSteps] = useState<TourStep[]>(TOUR_STEPS);
  const nextRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const step = availableSteps[stepIndex];
  const isLast = stepIndex === availableSteps.length - 1;
  const progress = `${stepIndex + 1} of ${availableSteps.length}`;

  const target = useMemo(() => {
    if (!step || typeof document === "undefined") return null;
    return document.querySelector<HTMLElement>(step.target);
  }, [step]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const existing = TOUR_STEPS.filter((candidate) => document.querySelector(candidate.target));
    setAvailableSteps(existing.length ? existing : TOUR_STEPS);
    setStepIndex(0);
    document.body.classList.add("tour-is-open");
    const timer = window.setTimeout(() => nextRef.current?.focus(), 80);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("tour-is-open");
      previousFocus.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !target) {
      setTargetRect(null);
      return;
    }
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center", inline: "nearest" });
    const update = () => {
      const rect = target.getBoundingClientRect();
      setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [open, target, stepIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function goNext() {
    if (isLast) onClose();
    else setStepIndex((value) => Math.min(value + 1, availableSteps.length - 1));
  }

  function goPrevious() {
    setStepIndex((value) => Math.max(value - 1, 0));
  }

  if (!open || !step) return null;

  const calloutStyle = targetRect ? {
    top: targetRect.top + targetRect.height + 18,
    left: Math.min(Math.max(16, targetRect.left), Math.max(16, window.innerWidth - 396)),
  } : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="guided-tour" aria-live="polite">
      {targetRect && <div className="guided-tour__spotlight" style={{ top: targetRect.top - 8, left: targetRect.left - 8, width: targetRect.width + 16, height: targetRect.height + 16 }} aria-hidden="true" />}
      <div className="guided-tour__scrim" aria-hidden="true" />
      <section className="guided-tour__card" style={calloutStyle} role="dialog" aria-modal="true" aria-labelledby="guided-tour-title" aria-describedby="guided-tour-description">
        <div className="guided-tour__topline">
          <span className="eyebrow">EDITH guided mode</span>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close guided mode" title="Close guided mode"><X size={17} aria-hidden="true" /></button>
        </div>
        <div className="guided-tour__progress"><span>Step {progress}</span><span className="guided-tour__progress-line" aria-hidden="true"><i style={{ width: `${((stepIndex + 1) / availableSteps.length) * 100}%` }} /></span></div>
        <h2 id="guided-tour-title">{step.title}</h2>
        <p id="guided-tour-description">{step.description}</p>
        <div className="guided-tour__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>Skip tour</button>
          <div>
            <button type="button" className="button button--secondary" onClick={goPrevious} disabled={stepIndex === 0}><ArrowLeft size={16} aria-hidden="true" /> Back</button>
            <button ref={nextRef} type="button" className="button button--primary" onClick={goNext}>{isLast ? <><Check size={16} aria-hidden="true" /> Finish</> : <>Next <ArrowRight size={16} aria-hidden="true" /></>}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
