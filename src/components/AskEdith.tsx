import { LoaderCircle, Mic, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AskEdithProps = {
  onAsk: (question: string) => void;
};

export function AskEdith({ onAsk }: AskEdithProps) {
  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setSpeechSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => recognitionRef.current?.stop();
  }, []);

  function startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => setQuestion(event.results[0]?.[0]?.transcript || "");
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    onAsk(trimmed);
    setQuestion("");
  }

  return (
    <section className="panel ask-panel" aria-labelledby="ask-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Scene-grounded assistant</span>
          <h2 id="ask-title">Ask EDITH</h2>
        </div>
        {listening && <LoaderCircle size={17} className="spin" aria-label="Listening" />}
      </div>
      <p className="panel-copy">Ask only about the latest scan. EDITH stays focused on what is ahead.</p>
      <form className="ask-form" onSubmit={submit} noValidate>
        <label className="sr-only" htmlFor="edith-question">Ask EDITH a question about the latest scan</label>
        <input id="edith-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What’s ahead?" autoComplete="off" />
        {speechSupported && <button type="button" className="icon-button" onClick={startListening} aria-label={listening ? "Listening for a question" : "Ask with your voice"} title={listening ? "Listening" : "Ask with your voice"} disabled={listening}>
          {listening ? <LoaderCircle size={17} className="spin" aria-hidden="true" /> : <Mic size={17} aria-hidden="true" />}
        </button>}
        <button type="submit" className="button button--primary" aria-label="Ask EDITH"><Send size={17} aria-hidden="true" /> Ask</button>
      </form>
      <div className="prompt-row" aria-label="Suggested questions">
        {["What’s ahead?", "Is the path clear?", "What should I watch out for?"].map((prompt) => (
          <button type="button" key={prompt} onClick={() => onAsk(prompt)}>{prompt}</button>
        ))}
      </div>
    </section>
  );
}
