import type { Alert } from "../types/alert";

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakText(text: string, muted = false) {
  if (muted || !canSpeak()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function speakAlert(alert: Alert, muted = false) {
  return speakText(alert.spoken_alert, muted);
}
