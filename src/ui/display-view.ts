// Renders the two-line HP-style display (X primary line, Y secondary line) from a DisplayState.

import type { DisplayState } from "../engine/display-format.js";

export interface DisplayElements {
  readonly xLineEl: HTMLElement;
  readonly yLineEl: HTMLElement;
  readonly displayEl: HTMLElement;
}

export function renderDisplay(elements: DisplayElements, state: DisplayState): void {
  elements.xLineEl.textContent = state.xLine;
  elements.yLineEl.textContent = state.isError ? "" : state.yLine;
  elements.displayEl.classList.toggle("display-error", state.isError);
}
