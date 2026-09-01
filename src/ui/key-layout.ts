// Defines the physical/on-screen key layout: each entry maps a key id, label, and the
// Command it emits. Used by keypad.ts to render buttons and by keyboard-input.ts as the
// canonical list of supported commands (kept in sync manually since the set is small/fixed).

import type { Command } from "../engine/commands.js";

export interface KeyDef {
  readonly id: string;
  readonly label: string;
  readonly secondaryLabel?: string;
  /** Omitted for spacer keys that render as empty, non-interactive placeholders. */
  readonly command?: Command;
}

export const KEY_LAYOUT: readonly KeyDef[] = [
  { id: "fix", label: "FIX", command: { kind: "displayMode", mode: "FIX" } },
  { id: "sci", label: "SCI", command: { kind: "displayMode", mode: "SCI" } },
  { id: "eng", label: "ENG", command: { kind: "displayMode", mode: "ENG" } },
  { id: "deg", label: "DEG", command: { kind: "angleMode", mode: "DEG" } },
  { id: "rad", label: "RAD", command: { kind: "angleMode", mode: "RAD" } },
  { id: "grad", label: "GRAD", command: { kind: "angleMode", mode: "GRAD" } },

  { id: "sin", label: "sin", command: { kind: "sin" } },
  { id: "cos", label: "cos", command: { kind: "cos" } },
  { id: "tan", label: "tan", command: { kind: "tan" } },
  { id: "pi", label: "\u03c0", command: { kind: "pi" } },
  { id: "rolldown", label: "R\u2193", command: { kind: "rollDown" } },
  { id: "swap", label: "X<>Y", command: { kind: "swapXY" } },

  { id: "reciprocal", label: "1/x", command: { kind: "reciprocal" } },
  { id: "exp", label: "e^x", command: { kind: "exp" } },
  { id: "sqrt", label: "\u221ax", command: { kind: "sqrt" } },
  { id: "power", label: "x^y", command: { kind: "power" } },
  { id: "spacer15", label: "" },
  { id: "spacer16", label: "" },

  { id: "enter", label: "ENTER", command: { kind: "enter" } },
  { id: "chs", label: "CHS", command: { kind: "chs" } },
  { id: "eex", label: "EEX", command: { kind: "eex" } },
  { id: "clx", label: "CLX", command: { kind: "clx" } },
  { id: "clearall", label: "CLEAR", command: { kind: "clearAll" } },

  { id: "sub", label: "\u2212", command: { kind: "sub" } },
  { id: "digit7", label: "7", command: { kind: "digit", value: "7" } },
  { id: "digit8", label: "8", command: { kind: "digit", value: "8" } },
  { id: "digit9", label: "9", command: { kind: "digit", value: "9" } },
  { id: "spacer9", label: "" },
  { id: "spacer10", label: "" },

  { id: "add", label: "+", command: { kind: "add" } },
  { id: "digit4", label: "4", command: { kind: "digit", value: "4" } },
  { id: "digit5", label: "5", command: { kind: "digit", value: "5" } },
  { id: "digit6", label: "6", command: { kind: "digit", value: "6" } },
  { id: "spacer7", label: "" },
  { id: "spacer8", label: "" },

  { id: "mul", label: "\u00d7", command: { kind: "mul" } },
  { id: "digit1", label: "1", command: { kind: "digit", value: "1" } },
  { id: "digit2", label: "2", command: { kind: "digit", value: "2" } },
  { id: "digit3", label: "3", command: { kind: "digit", value: "3" } },
  { id: "spacer5", label: "" },
  { id: "spacer6", label: "" },

  { id: "div", label: "\u00f7", command: { kind: "div" } },
  { id: "digit0", label: "0", command: { kind: "digit", value: "0" } },
  { id: "decimal", label: ".", command: { kind: "decimalPoint" } },
];
