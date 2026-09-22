# EDITH

EDITH is an audio-first, risk-prioritized environmental awareness assistant for blind and low-vision pedestrians.

It is deliberately not an image-captioning interface. A real multimodal vision model provides structured scene perception, then local application logic decides what deserves the user's attention:

```text
Camera frame → Vision API → SceneAnalysis → Relevance engine → One alert → Speech
```

## Run locally

Requirements: Node.js 20+.

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

For Live Mode, choose one of these provider configurations in `.env`.

### Free local mode — Ollama

Ollama runs the vision model on your computer, so there is no API bill. Ollama supports OpenAI-compatible chat completions with image input. Install a vision model first:

```bash
ollama pull gemma3:4b
```

Then use:

```text
AI_PROVIDER=ollama
AI_API_KEY=ollama
AI_MODEL=gemma3:4b
AI_BASE_URL=http://127.0.0.1:11434/v1
```

### No-cost hosted quota — Groq

Groq provides an OpenAI-compatible vision endpoint; availability and quota depend on its current free/developer plan. Use a Groq API key and a vision model such as `qwen/qwen3.8-27b`:

```text
AI_PROVIDER=groq
AI_API_KEY=your_groq_key
AI_MODEL=qwen/qwen3.8-27b
AI_BASE_URL=https://api.groq.com/openai/v1
```

### Paid OpenAI mode

```text
AI_PROVIDER=openai
AI_API_KEY=your_server_side_key
AI_MODEL=your_vision_capable_model
AI_BASE_URL=
```

The backend uses an OpenAI-compatible `/chat/completions` request with an image input and structured JSON response. The browser never receives the key.

If Live Mode is not configured, use Demo Mode. Demo Mode passes prepared `SceneAnalysis` objects through the same prioritization, alert generation, duplicate suppression, speech, and history code as live mode.

## Verification commands

```bash
npm run typecheck
npm test
npm run build
```

The unit suite covers urgent hazards, informational signs, clear paths, noisy-scene filtering, malformed-safe engine boundaries, and duplicate suppression.

## Review scenarios

Demo Mode includes:

1. Immediate person/obstacle.
2. Stairs to the right.
3. Clear path.
4. Relevance filtering with multiple objects.

The fourth scene is the core EDITH proof: the system selects one relevant object instead of narrating the entire image.

## Privacy and limitations

Frames are analyzed temporarily for this experimental prototype and are not intentionally stored by the application. Only alert history is stored locally.

The prototype does not implement face recognition, GPS, SOS, physical glasses, continuous detection, or autonomous navigation. It is not certified for safety-critical or medical use.
