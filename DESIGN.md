---
version: alpha
colors:
  primary: "#9BE3D4"
  ink: "#0B1114"
  panel: "#142026"
  panelStrong: "#1B2B31"
  text: "#E9F0EE"
  muted: "#91A3A6"
  signal: "#9BE3D4"
  urgent: "#F0B35B"
  informative: "#7E95FF"
  line: "#2B3A40"
  danger: "#F07D7D"
typography:
  display:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.5rem"
    lineHeight: "1"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: "1.5"
  utility:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.72rem"
    lineHeight: "1.3"
rounded:
  sm: "0.5rem"
  md: "0.8rem"
  lg: "1.1rem"
spacing:
  unit: "0.25rem"
  section: "2rem"
components:
  panel:
    backgroundColor: "var(--color-panel)"
    textColor: "var(--color-text)"
    rounded: "var(--radius-lg)"
    padding: "1.25rem"
  primaryButton:
    backgroundColor: "var(--color-signal)"
    textColor: "var(--color-ink)"
    rounded: "var(--radius-md)"
  urgentAlert:
    backgroundColor: "rgba(240, 179, 91, 0.08)"
    textColor: "var(--color-urgent)"
    rounded: "var(--radius-lg)"
  attentionRail:
    textColor: "var(--color-muted)"
    rounded: "var(--radius-sm)"
  cameraSurface:
    backgroundColor: "var(--color-panel-strong)"
    rounded: "var(--radius-lg)"
  infoBadge:
    backgroundColor: "var(--color-informative)"
    textColor: "var(--color-ink)"
    rounded: "999px"
---

## Overview

EDITH is an assistive control console for an audio-first product. The interface should feel like a calm night-vision instrument: quiet enough for repeated use, but decisive when an attention-worthy event is present. The product's visual signature is the Attention Rail, a persistent LEFT / CENTER / RIGHT orientation marker that mirrors the spoken direction.

This is a product surface, not a marketing landing page. The screen's job is to make the scan state, primary decision, audio state, and recovery path immediately legible.

Anti-references: generic chatbot bubbles, noisy computer-vision dashboards, neon sci-fi HUD decoration, and dense status grids that make the user search for the one useful signal.

## Colors

Ink and panel colors create a low-glare dark surface. Signal mint means the system is ready or active, urgent amber means attention is required, and periwinkle marks informational context. Every semantic color is paired with text, position, or an icon; color never carries meaning alone.

## Typography

Space Grotesk gives the EDITH name and large state labels a measured instrument character. IBM Plex Sans carries instructions and alerts with generous legibility. IBM Plex Mono is reserved for compact operational values such as timestamps, camera status, and priority labels.

## Layout

The desktop layout is a two-column console: the camera and scan control occupy the dominant left stage, while the current alert and recent history form the decision rail on the right. On narrow screens it becomes one readable vertical flow: current alert first after the camera, then controls, then history and privacy.

Use large breathing room around the current alert. The Attention Rail should sit near the alert instead of becoming decorative chrome. Content should remain reachable with document scrolling; do not trap the whole page in a fixed viewport.

## Elevation & Depth

Panels are mostly flat with thin line borders. Use the console shadow only on the main application shell and avoid floating-card clutter. Urgent state is represented by an amber edge and label treatment, not by a glowing effect.

## Shapes

Controls use a medium radius with crisp borders. The Scan control may be larger and more prominent than secondary actions, but it should remain a real button with visible hover, focus, pressed, and busy states. Avoid pill-heavy UI except for compact status badges.

## Components

- **Camera preview:** a framed media surface with an explicit camera state and a quiet scan target marker.
- **Current alert:** the single primary decision, with priority, object, direction, confidence context, and spoken message.
- **Attention Rail:** a left/center/right track with an active direction marker and accessible text equivalent.
- **Status indicator:** text and a small marker for ready, analyzing, demo, error, and privacy states.
- **History row:** timestamp, priority, object, direction, and the exact spoken alert; newest first.
- **Audio controls:** Replay and Mute buttons with explicit labels and stable dimensions.

## Do's and Don'ts

- Do let the alert and its direction dominate the visual hierarchy.
- Do preserve a calm, high-contrast reading surface in every state.
- Do show errors as recovery instructions rather than vague status copy.
- Do make Demo Mode visibly honest and visually distinct from Live Mode.
- Do not narrate or display a full object list as the product's main output.
- Do not use color, animation, or decorative HUD elements to substitute for clear language.
