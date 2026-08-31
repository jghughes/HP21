// Defines the physical/on-screen key layout: each entry maps a key id, label, and the
// Command it emits. Used by keypad.ts to render buttons and by keyboard-input.ts as the
// canonical list of supported commands (kept in sync manually since the set is small/fixed).

import type { Command } from "../engine/commands.js";

export interface KeyDef {
  readonly id: string;
  readonly label: string;
  readonly secondaryLabel?: string;
  readonly command: Command;
}

export const KEY_LAYOUT: readonly KeyDef[] = [
  { id: "sin", label: "sin", command: { kind: "sin" } },
  { id: "cos", label: "cos", command: { kind: "cos" } },
  { id: "tan", label: "tan", command: { kind: "tan" } },
  { id: "deg", label: "DEG", command: { kind: "angleMode", mode: "DEG" } },
  { id: "rad", label: "RAD", command: { kind: "angleMode", mode: "RAD" } },
  { id: "grad", label: "GRAD", command: { kind: "angleMode", mode: "GRAD" } },

  { id: "fix", label: "FIX", command: { kind: "displayMode", mode: "FIX" } },
  { id: "sci", label: "SCI", command: { kind: "displayMode", mode: "SCI" } },
  { id: "eng", label: "ENG", command: { kind: "displayMode", mode: "ENG" } },
  { id: "power", label: "x^y", command: { kind: "power" } },
  { id: "rolldown", label: "R\u2193", command: { kind: "rollDown" } },
  { id: "swap", label: "X<>Y", command: { kind: "swapXY" } },

  { id: "div", label: "\u00f7", command: { kind: "div" } },
  { id: "digit7", label: "7", command: { kind: "digit", value: "7" } },
  { id: "digit8", label: "8", command: { kind: "digit", value: "8" } },
  { id: "digit9", label: "9", command: { kind: "digit", value: "9" } },
  { id: "clx", label: "CLX", command: { kind: "clx" } },
  { id: "clearall", label: "CLEAR", command: { kind: "clearAll" } },

  { id: "mul", label: "\u00d7", command: { kind: "mul" } },
  { id: "digit4", label: "4", command: { kind: "digit", value: "4" } },
  { id: "digit5", label: "5", command: { kind: "digit", value: "5" } },
  { id: "digit6", label: "6", command: { kind: "digit", value: "6" } },
  { id: "eex", label: "EEX", command: { kind: "eex" } },
  { id: "chs", label: "CHS", command: { kind: "chs" } },

  { id: "sub", label: "\u2212", command: { kind: "sub" } },
  { id: "digit1", label: "1", command: { kind: "digit", value: "1" } },
  { id: "digit2", label: "2", command: { kind: "digit", value: "2" } },
  { id: "digit3", label: "3", command: { kind: "digit", value: "3" } },
  { id: "enter", label: "ENTER", command: { kind: "enter" } },

  { id: "add", label: "+", command: { kind: "add" } },
  { id: "digit0", label: "0", command: { kind: "digit", value: "0" } },
  { id: "decimal", label: ".", command: { kind: "decimalPoint" } },
];
