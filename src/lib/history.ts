import type { AlertHistoryItem } from "../types/alert";

const STORAGE_KEY = "edith-alert-history";
const MAX_HISTORY = 30;

export function loadHistory(): AlertHistoryItem[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: AlertHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    // History is a convenience; the live alert must remain usable if storage is unavailable.
  }
}
