// Command vocabulary shared between the UI layer (keypad/keyboard) and the calculator engine.
// Each command is a discriminated union member so the dispatcher can exhaustively switch on `kind`.

export type AngleMode = "DEG" | "RAD" | "GRAD";
export type DisplayMode = "FIX" | "SCI" | "ENG";

export type Command =
  | { kind: "digit"; value: string } // "0".."9"
  | { kind: "decimalPoint" }
  | { kind: "enter" }
  | { kind: "chs" }
  | { kind: "clx" }
  | { kind: "clearAll" }
  | { kind: "rollDown" }
  | { kind: "swapXY" }
  | { kind: "store" }
  | { kind: "recall" }
  | { kind: "eex" }
  | { kind: "add" }
  | { kind: "sub" }
  | { kind: "mul" }
  | { kind: "div" }
  | { kind: "power" }
  | { kind: "sin" }
  | { kind: "cos" }
  | { kind: "tan" }
  | { kind: "reciprocal" }
  | { kind: "exp" }
  | { kind: "sqrt" }
  | { kind: "pi" }
  | { kind: "angleMode"; mode: AngleMode }
  | { kind: "displayMode"; mode: DisplayMode }
  | { kind: "modeDigit"; value: string }; // digit following a pending FIX/SCI/ENG mode key
