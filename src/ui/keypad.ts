// Renders the keypad grid from KEY_LAYOUT and wires click/touch events to a supplied handler.

import { KEY_LAYOUT } from "./key-layout.js";
import type { AngleMode, Command, DisplayMode } from "../engine/commands.js";

const ANGLE_MODE_KEY_IDS: Record<AngleMode, string> = {
  DEG: "deg",
  RAD: "rad",
  GRAD: "grad",
};

const DISPLAY_MODE_KEY_IDS: Record<DisplayMode, string> = {
  FIX: "fix",
  SCI: "sci",
  ENG: "eng",
};

export function renderKeypad(container: HTMLElement, onCommand: (command: Command) => void): void {
  container.innerHTML = "";
  container.setAttribute("role", "group");
  container.setAttribute("aria-label", "Calculator keypad");

  for (const key of KEY_LAYOUT) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "key";
    button.dataset["keyId"] = key.id;

    if (!key.command) {
      button.classList.add("key-spacer");
      button.disabled = true;
      button.setAttribute("aria-hidden", "true");
      button.tabIndex = -1;
      container.appendChild(button);
      continue;
    }

    button.setAttribute("aria-label", key.label);

    const label = document.createElement("span");
    label.className = "key-label";
    label.textContent = key.label;
    button.appendChild(label);

    button.addEventListener("click", () => {
      onCommand(key.command!);
    });

    container.appendChild(button);
  }
}

/** Highlights whichever DEG/RAD/GRAD key matches the currently active angle mode. */
export function updateActiveAngleMode(container: HTMLElement, angleMode: AngleMode): void {
  for (const mode of Object.keys(ANGLE_MODE_KEY_IDS) as AngleMode[]) {
    const keyId = ANGLE_MODE_KEY_IDS[mode];
    const button = container.querySelector<HTMLButtonElement>(`[data-key-id="${keyId}"]`);
    button?.classList.toggle("key-active", mode === angleMode);
  }
}

/** Highlights whichever FIX/SCI/ENG key matches the currently active display mode.
 *  If pendingMode is set (FIX/SCI/ENG pressed, awaiting its decimal-place digit), that
 *  key is highlighted instead, so pressing the key gives immediate visual feedback. */
export function updateActiveDisplayMode(
  container: HTMLElement,
  displayMode: DisplayMode,
  pendingMode: DisplayMode | null = null
): void {
  const highlightMode = pendingMode ?? displayMode;
  for (const mode of Object.keys(DISPLAY_MODE_KEY_IDS) as DisplayMode[]) {
    const keyId = DISPLAY_MODE_KEY_IDS[mode];
    const button = container.querySelector<HTMLButtonElement>(`[data-key-id="${keyId}"]`);
    button?.classList.toggle("key-active", mode === highlightMode);
  }
}
