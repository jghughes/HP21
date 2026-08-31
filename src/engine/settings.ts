// Persisted user settings: angle mode, display mode, and decimal-place count.
// Loaded/saved via localStorage; falls back to defaults (DEG, FIX-4) when absent or invalid.

import type { AngleMode, DisplayMode } from "./commands.js";

export interface Settings {
  angleMode: AngleMode;
  displayMode: DisplayMode;
  decimalPlaces: number;
}

const STORAGE_KEY = "hp21.settings";

export const DEFAULT_SETTINGS: Settings = {
  angleMode: "DEG",
  displayMode: "FIX",
  decimalPlaces: 4,
};

function isAngleMode(value: unknown): value is AngleMode {
  return value === "DEG" || value === "RAD" || value === "GRAD";
}

function isDisplayMode(value: unknown): value is DisplayMode {
  return value === "FIX" || value === "SCI" || value === "ENG";
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return { ...DEFAULT_SETTINGS };
    }
    const candidate = parsed as Partial<Settings>;
    const angleMode = isAngleMode(candidate.angleMode)
      ? candidate.angleMode
      : DEFAULT_SETTINGS.angleMode;
    const displayMode = isDisplayMode(candidate.displayMode)
      ? candidate.displayMode
      : DEFAULT_SETTINGS.displayMode;
    const decimalPlaces =
      typeof candidate.decimalPlaces === "number" &&
      Number.isInteger(candidate.decimalPlaces) &&
      candidate.decimalPlaces >= 0 &&
      candidate.decimalPlaces <= 9
        ? candidate.decimalPlaces
        : DEFAULT_SETTINGS.decimalPlaces;
    return { angleMode, displayMode, decimalPlaces };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures (e.g., private browsing quota) - settings just won't persist.
  }
}
