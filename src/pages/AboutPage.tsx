import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, AudioLines, BrainCircuit, Camera, CheckCircle2, ChevronRight, Eye, Filter, GitBranch, LockKeyhole, Mic2, Orbit, Play, ShieldCheck, Sparkles, Volume2, Waves, Zap } from "lucide-react";
import { SiteNav } from "../components/SiteNav";
import { demoScenes } from "../demo/demoScenes";
import { prioritizeScene } from "../engine/prioritization";
import { speakText } from "../lib/speech";
import type { Alert } from "../types/alert";

type AboutPageProps = { onNavigate: (path: "/" | "/about") => void };

type RevealProps = { children: React.ReactNode; className?: string; id?: string };

function Reveal({ children, className = "", id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <section ref={ref} id={id} className={`story-section reveal ${visible ? "is-visible" : ""} ${className}`}>{children}</section>;
}

const architectureNodes = [
  { id: "camera", label: "Camera", kicker: "INPUT", icon: Camera, copy: "A single captured frame starts the interaction. EDITH does not continuously stream frames to the model in this prototype." },
  { id: "vision", label: "Multimodal vision AI", kicker: "PERCEPTION", icon: Eye, copy: "Perception only. The real vision model identifies environmental entities and estimates direction, distance category, motion, and confidence." },
  { id: "scene", label: "SceneAnalysis", kicker: "STRUCTURE", icon: GitBranch, copy: "A validated, predictable contract separates what the model saw from what the application chooses to communicate." },
  { id: "engine", label: "Risk / relevance engine", kicker: "DECISION", icon: Filter, copy: "Decision only. Local deterministic rules determine what deserves attention using path relevance, proximity, motion, category, and confidence." },
  { id: "alert", label: "Primary alert", kicker: "COMMUNICATION", icon: Zap, copy: "One short, actionable message. The application generates the wording instead of passing arbitrary model prose to speech." },
  { id: "speech", label: "Speech", kicker: "VOICE", icon: AudioLines, copy: "Browser speech synthesis makes the alert audible. The screen remains a control and feedback surface, not the whole product." },
] as const;

const decisionExamples: Array<{ label: string; detail: string; priority: Alert["priority"]; object: string }> = [
  { label: "Far tree", detail: "Not blocking the walking path", priority: "none", object: "tree" },
  { label: "Side sign", detail: "Useful context, not immediate risk", priority: "informational", object: "sign" },
  { label: "Near person", detail: "Center of the walking path", priority: "urgent", object: "person" },
  { label: "Near stairs", detail: "Navigation hazard to the right", priority: "urgent", object: "stairs" },
  { label: "Approaching vehicle", detail: "Motion increases immediate risk", priority: "urgent", object: "vehicle" },
];

function scrollToStory() {
  const target = document.getElementById("edith-story");
  target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const [activeNode, setActiveNode] = useState("engine");
  const [activeDecision, setActiveDecision] = useState(2);
  const [demoId, setDemoId] = useState(demoScenes[0].id);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const activeArchitecture = architectureNodes.find((node) => node.id === activeNode) || architectureNodes[3];
  const demoScene = demoScenes.find((scene) => scene.id === demoId) || demoScenes[0];
  const demoAlert = useMemo(() => prioritizeScene(demoScene.analysis), [demoScene]);

  function playAudioDemo() {
    setAudioPlaying(true);
    speakText("Person directly ahead. Slow down.");
    window.setTimeout(() => setAudioPlaying(false), 2600);
  }

  return (
    <main className="about-page">
      <div className="about-page__noise" aria-hidden="true" />
      <SiteNav active="about" onNavigate={onNavigate} />

      <section className="story-hero" aria-labelledby="story-hero-title">
        <div className="story-hero__copy">
          <span className="story-kicker"><span className="story-kicker__line" /> EDITH / PROJECT STORY</span>
          <h1 id="story-hero-title">The problem isn’t seeing <em>everything.</em></h1>
          <p className="story-hero__reveal">It’s knowing <strong>what matters right now.</strong></p>
          <p className="story-hero__body">EDITH is an experimental camera-based, audio-first environmental-awareness assistant designed to help blind and low-vision pedestrians understand the immediate scene without being overwhelmed by it.</p>
          <button type="button" className="story-link" onClick={scrollToStory}>Explore how it works <ArrowDown size={16} aria-hidden="true" /></button>
        </div>
        <div className="story-hero__visual" aria-label="Abstract eye and camera visualization" role="img">
          <div className="eye-orbit eye-orbit--outer" />
          <div className="eye-orbit eye-orbit--inner" />
          <div className="eye-core"><Eye size={56} strokeWidth={1.1} aria-hidden="true" /></div>
          <span className="hero-signal hero-signal--one">SCAN / 01</span>
          <span className="hero-signal hero-signal--two">FILTER / ∞</span>
          <span className="hero-signal hero-signal--three">AUDIO / ON</span>
        </div>
        <div className="story-hero__footline"><span>PERCEPTION ≠ DECISION</span><span>ONE FRAME / ONE ALERT</span></div>
      </section>

      <div id="edith-story" className="story-anchor" />

      <Reveal className="story-section--split">
        <div className="story-section__intro">
          <span className="story-kicker">01 / THE PROBLEM</span>
          <h2>When everything is important, <em>nothing is.</em></h2>
        </div>
        <div className="story-section__content">
          <p className="story-lede">A camera can detect many objects. A useful assistive system should not make the user process a running commentary of trees, buildings, signs, people, vehicles, benches, and background noise.</p>
          <div className="question-mark">“What matters <span>right now?</span>”</div>
          <div className="object-cloud" aria-label="Background scene objects filtered for relevance">
            {["tree", "building", "sign", "bench", "person", "vehicle", "stairs"].map((item, index) => <span key={item} style={{ "--object-index": index } as React.CSSProperties}>{item}</span>)}
            <div className="object-cloud__filter"><Filter size={18} aria-hidden="true" /> relevance</div>
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section--filter" id="filtering">
        <div className="section-heading section-heading--center">
          <span className="story-kicker">02 / THE EDITH IDEA</span>
          <h2>EDITH doesn’t narrate the world.<br /><em>It prioritizes it.</em></h2>
          <p>Multiple perceived entities collapse into the one decision that is most useful to the person moving through the scene.</p>
        </div>
        <div className="filter-flow" aria-label="EDITH relevance filtering process">
          <div className="filter-flow__raw"><span className="flow-label">RAW SCENE</span><div className="raw-stack"><span>person</span><span>tree</span><span>sign</span><span>building</span><span>stairs</span></div></div>
          <ArrowRight className="filter-flow__arrow" size={26} aria-hidden="true" />
          <div className="filter-flow__decision"><span className="flow-label">RELEVANCE</span><div className="decision-funnel"><Filter size={28} aria-hidden="true" /><span>path / risk / now</span></div></div>
          <ArrowRight className="filter-flow__arrow" size={26} aria-hidden="true" />
          <div className="filter-flow__alert"><span className="flow-label">ONE ALERT</span><strong>Stairs ahead<br />on your right.</strong></div>
        </div>
      </Reveal>

      <Reveal className="story-section--architecture">
        <div className="section-heading">
          <span className="story-kicker">03 / UNDER THE HOOD</span>
          <h2>Perception<br /><em>≠ decision.</em></h2>
          <p>The technical novelty is not sending an image to an AI. It is the explicit separation between what is perceived and what is worth communicating.</p>
        </div>
        <div className="architecture-layout">
          <div className="architecture-diagram" aria-label="EDITH system architecture">
            {architectureNodes.map((node, index) => {
              const Icon = node.icon;
              return <div key={node.id} className="architecture-step-wrap"><button type="button" className={`architecture-step ${activeNode === node.id ? "is-active" : ""}`} onClick={() => setActiveNode(node.id)} aria-pressed={activeNode === node.id}><span>{String(index + 1).padStart(2, "0")}</span><Icon size={17} aria-hidden="true" /><strong>{node.label}</strong><small>{node.kicker}</small></button>{index < architectureNodes.length - 1 && <div className={`architecture-connector ${activeNode === node.id ? "is-active" : ""}`} aria-hidden="true">↓</div>}</div>;
            })}
          </div>
          <div className="architecture-detail" aria-live="polite">
            <span className="eyebrow">{activeArchitecture.kicker}</span>
            <h3>{activeArchitecture.label}</h3>
            <p>{activeArchitecture.copy}</p>
            <div className="architecture-detail__rule" />
            <span className="architecture-detail__note">Click a layer to inspect its responsibility.</span>
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section--decision">
        <div className="section-heading section-heading--center">
          <span className="story-kicker">04 / THE DECISION ENGINE</span>
          <h2>The most important output<br /><em>can be: NONE.</em></h2>
          <p>EDITH weighs category, distance category, direction, motion, path relevance, and confidence. These are estimates, not precise measurements.</p>
        </div>
        <div className="decision-spectrum" aria-label="Decision priority examples">
          <div className="decision-spectrum__labels"><span>IGNORE</span><span>INFORMATIONAL</span><span>URGENT</span></div>
          <div className="decision-spectrum__line"><i /><i /><i /></div>
          <div className="decision-spectrum__examples">
            {decisionExamples.map((example, index) => <button type="button" key={example.label} className={`decision-example decision-example--${example.priority} ${activeDecision === index ? "is-selected" : ""}`} onClick={() => setActiveDecision(index)}><span className="decision-example__dot" /><strong>{example.label}</strong><small>{example.detail}</small></button>)}
          </div>
        </div>
        <div className="decision-readout"><span className="eyebrow">Selected rule</span><strong>{decisionExamples[activeDecision].label}</strong><span>{decisionExamples[activeDecision].detail}</span><b className={`priority-badge priority-badge--${decisionExamples[activeDecision].priority}`}>{decisionExamples[activeDecision].priority}</b></div>
      </Reveal>

      <Reveal className="story-section--one-alert">
        <div className="one-alert__visual">
          <div className="noise-list" aria-label="Objects in a noisy scene">{["PERSON", "TREE", "SIGN", "BUILDING", "CAR", "STAIRS", "BENCH"].map((item) => <span key={item}>{item}</span>)}</div>
          <div className="one-alert__collapse"><Filter size={18} aria-hidden="true" /></div>
          <div className="one-alert__result"><span className="priority-badge priority-badge--urgent">urgent</span><strong>Stairs ahead<br />on your right.</strong></div>
        </div>
        <div className="one-alert__copy"><span className="story-kicker">05 / WHY ONE ALERT?</span><h2>One message beats<br /><em>a wall of text.</em></h2><p>The prototype deliberately limits output to one primary alert per scan to reduce unnecessary cognitive load. Selective communication is the product behavior, not a cosmetic filter.</p></div>
      </Reveal>

      <Reveal className="story-section--audio">
        <div className="section-heading">
          <span className="story-kicker">06 / AUDIO-FIRST EXPERIENCE</span>
          <h2>The screen is<br /><em>not the product.</em></h2>
          <p>The primary experience is audio. The interface exists to control, inspect, and understand the system.</p>
        </div>
        <div className="audio-demo">
          <div className="audio-demo__topline"><span className="priority-badge priority-badge--urgent">urgent</span><span className="audio-demo__direction">center / direct ahead</span></div>
          <div className="audio-demo__message">“Person directly ahead.<br />Slow down.”</div>
          <div className={`waveform ${audioPlaying ? "is-playing" : ""}`} aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ "--wave-index": index } as React.CSSProperties} />)}</div>
          <button type="button" className="button button--secondary" onClick={playAudioDemo}><Play size={16} aria-hidden="true" /> {audioPlaying ? "Speaking…" : "Play audio demo"}</button>
          <span className="audio-demo__hint">Audio only starts after an intentional action.</span>
        </div>
      </Reveal>

      <Reveal className="story-section--ask">
        <div className="ask-story__visual"><span className="story-kicker">SCENE-GROUNDED</span><div className="ask-bubble ask-bubble--user">What’s ahead?</div><div className="ask-bubble ask-bubble--edith">Stairs ahead on your right.</div><span className="ask-story__line" /></div>
        <div className="ask-story__copy"><span className="story-kicker">07 / ASK EDITH</span><h2>Ask, but stay<br /><em>grounded.</em></h2><p>Ask EDITH only uses the latest SceneAnalysis and Alert. No unrelated knowledge. No open-ended hallucination. No answers outside the current scene context.</p><div className="ask-story__prompts"><span>“What’s ahead?”</span><span>“Is the path clear?”</span><span>“What should I watch out for?”</span></div></div>
      </Reveal>

      <Reveal className="story-section--demo">
        <div className="section-heading section-heading--center"><span className="story-kicker">08 / DEMO MODE</span><h2>When the real world<br /><em>isn’t available.</em></h2><p>Prepared SceneAnalysis inputs pass through the same validation, prioritization, alert, speech, and history pipeline as the live prototype.</p></div>
        <div className="story-demo-grid">
          <div className="story-demo-tabs" role="tablist" aria-label="Demo scenarios">{demoScenes.map((scene, index) => <button type="button" key={scene.id} role="tab" aria-selected={demoId === scene.id} className={demoId === scene.id ? "is-active" : ""} onClick={() => setDemoId(scene.id)}><span>0{index + 1}</span>{scene.label}</button>)}</div>
          <div className="story-demo-readout"><div className="story-demo-readout__meta"><span className="mode-chip mode-chip--demo">DEMO MODE</span><span>{demoScene.description}</span></div><div className="story-demo-readout__pipeline"><span>SceneAnalysis</span><ArrowRight size={15} aria-hidden="true" /><span>Decision engine</span><ArrowRight size={15} aria-hidden="true" /><strong>{demoAlert.priority}</strong></div><p>“{demoAlert.spoken_alert}”</p><small>Selected object: {demoAlert.object} / direction: {demoAlert.direction}</small></div>
        </div>
      </Reveal>

      <Reveal className="story-section--privacy">
        <div className="privacy-story-card"><div className="privacy-story-card__icon"><LockKeyhole size={28} aria-hidden="true" /></div><span className="story-kicker">09 / TRUST BOUNDARY</span><h2>Assistive does not<br /><em>mean invisible.</em></h2><p>Frames are analyzed temporarily for this experimental prototype and are not intentionally stored by the application.</p><div className="privacy-story-grid"><span><i className="status-dot status-dot--active" /> Camera <b>ACTIVE</b></span><span><i className="status-dot" /> Recording <b>OFF</b></span><span><i className="status-dot" /> Frame storage <b>OFF</b></span></div></div>
        <div className="limits-story"><span className="story-kicker">LIMITS, ON PURPOSE</span><ul><li><CheckCircle2 size={16} aria-hidden="true" /> No face or identity recognition</li><li><CheckCircle2 size={16} aria-hidden="true" /> No emergency messaging</li><li><CheckCircle2 size={16} aria-hidden="true" /> No safety certification</li><li><CheckCircle2 size={16} aria-hidden="true" /> No guaranteed detection</li></ul><p>EDITH is an experimental assistive prototype — not autonomous navigation.</p></div>
      </Reveal>

      <Reveal className="story-section--evaluation">
        <div className="section-heading"><span className="story-kicker">10 / EVALUATION</span><h2>How do we know<br /><em>it works?</em></h2><p>The prototype is evaluated on decision quality, not just the number of objects it can identify.</p></div>
        <div className="evaluation-grid">{["Priority correctness", "Relevant-object selection", "Unnecessary-alert rate", "Directional correctness", "Alert concision", "Speech clarity", "End-to-end latency", "Offline reliability"].map((metric) => <div className="evaluation-card" key={metric}><span>METRIC TO BE EVALUATED</span><strong>{metric}</strong><div className="evaluation-card__line" /></div>)}</div>
      </Reveal>

      <Reveal className="story-section--roadmap">
        <div className="section-heading section-heading--center"><span className="story-kicker">11 / ROADMAP</span><h2>From prototype<br /><em>to research system.</em></h2><p>Each phase increases context, multimodality, privacy, and evidence — without pretending the current prototype already has those capabilities.</p></div>
        <div className="roadmap-track">{[
          ["01", "Current 25%", "Single-frame perception + prioritization + speech"],
          ["02", "Context", "OCR + temporal awareness + better direction/distance"],
          ["03", "Environmental audio", "Horns + alarms + vehicle events"],
          ["04", "Navigation", "Contextual route and crossing awareness"],
          ["05", "Wearable", "Camera + bone-conduction audio"],
          ["06", "Performance", "On-device inference + lower latency + privacy"],
          ["07", "Evaluation", "Benchmarks + false-positive analysis + accessibility testing"],
        ].map(([number, title, copy]) => <article className="roadmap-card" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </Reveal>

      <footer className="story-footer"><div className="story-footer__visual"><div className="footer-eye"><Orbit size={46} strokeWidth={1} aria-hidden="true" /><span /></div></div><span className="story-kicker">FINAL SIGNAL</span><h2>EDITH doesn’t try to<br />describe the world.</h2><p>It tries to tell you <em>what matters.</em></p><strong>SEE LESS.<br />UNDERSTAND MORE.</strong><div className="story-footer__actions"><button type="button" className="button button--primary" onClick={() => onNavigate("/")}><Sparkles size={16} aria-hidden="true" /> Try EDITH</button><button type="button" className="button button--secondary" onClick={() => onNavigate("/")}><Waves size={16} aria-hidden="true" /> Take the tour</button></div></footer>
    </main>
  );
}
