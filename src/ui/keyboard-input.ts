// Maps physical keyboard events to Command tokens, per the approved keyboard mapping spec.

import type { Command } from "../engine/commands.js";

export function mapKeyboardEvent(event: KeyboardEvent): Command | null {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    return { kind: "digit", value: key };
  }

  if (key === ".") {
    return { kind: "decimalPoint" };
  }

  if (key === "Enter") {
    return { kind: "enter" };
  }

  if (key === "Backspace") {
    return { kind: "clx" };
  }

  if (key === "Escape") {
    return { kind: "clearAll" };
  }

  if (key === "+") {
    return { kind: "add" };
  }

  if (key === "-") {
    return { kind: "sub" };
  }

  if (key === "*") {
    return { kind: "mul" };
  }

  if (key === "/") {
    return { kind: "div" };
  }

  if (key === "^") {
    return { kind: "power" };
  }

  if (event.shiftKey) {
    switch (key) {
      case "R":
        return { kind: "angleMode", mode: "RAD" };
      case "S":
        return { kind: "displayMode", mode: "SCI" };
      case "E":
        return { kind: "displayMode", mode: "ENG" };
      default:
        return null;
    }
  }

  switch (key) {
    case "p":
      return { kind: "power" };
    case "s":
      return { kind: "sin" };
    case "c":
      return { kind: "cos" };
    case "t":
      return { kind: "tan" };
    case "r":
    case "ArrowDown":
      return { kind: "rollDown" };
    case "x":
      return { kind: "swapXY" };
    case "n":
      return { kind: "chs" };
    case "e":
      return { kind: "eex" };
    case "d":
      return { kind: "angleMode", mode: "DEG" };
    case "g":
      return { kind: "angleMode", mode: "GRAD" };
    case "f":
      return { kind: "displayMode", mode: "FIX" };
    default:
      return null;
  }
}
