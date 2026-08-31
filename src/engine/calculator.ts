// Orchestrates the Stack, Settings, and digit-entry state, dispatching Command tokens.
// This is the single entry point the UI talks to: execute(command) then getDisplayState().

import type { AngleMode, Command, DisplayMode } from "./commands.js";
import { Stack } from "./stack.js";
import * as ops from "./operations.js";
import { isCalcError } from "./errors.js";
import { type Settings, loadSettings, saveSettings } from "./settings.js";
import { type DisplayState, formatNumber, formatSecondary } from "./display-format.js";

type PendingModeKey = DisplayMode | null;

export class Calculator {
  private readonly stack = new Stack();
  private settings: Settings;

  /** True while the user is actively typing digits/decimal/exponent into X. */
  private entryInProgress = false;
  /** Raw text buffer for the entry in progress (mantissa + optional exponent suffix). */
  private entryBuffer = "";
  /** True once EEX has been pressed during the current entry; subsequent digits edit the exponent. */
  private exponentEntryActive = false;
  private exponentBuffer = "";
  private mantissaNegative = false;
  private exponentNegative = false;

  /** Set after FIX/SCI/ENG is pressed, awaiting the following decimal-place digit. */
  private pendingModeKey: PendingModeKey = null;

  private isError = false;

  constructor() {
    this.settings = loadSettings();
  }

  execute(command: Command): void {
    // A pending FIX/SCI/ENG mode key is only fulfilled by a digit 0-9; anything else
    // silently cancels it and then falls through to normal processing of the new command.
    if (this.pendingModeKey !== null) {
      if (command.kind === "digit") {
        this.applyDisplayModeDigit(this.pendingModeKey, command.value);
        this.pendingModeKey = null;
        return;
      }
      this.pendingModeKey = null;
    }

    if (this.isError) {
      // Any key clears the error state before being processed normally.
      this.isError = false;
    }

    switch (command.kind) {
      case "digit":
        this.inputDigit(command.value);
        break;
      case "decimalPoint":
        this.inputDecimalPoint();
        break;
      case "enter":
        this.doEnter();
        break;
      case "chs":
        this.doChs();
        break;
      case "clx":
        this.doClx();
        break;
      case "clearAll":
        this.doClearAll();
        break;
      case "rollDown":
        this.commitEntryIfNeeded();
        this.stack.rollDown();
        break;
      case "swapXY":
        this.commitEntryIfNeeded();
        this.stack.swapXY();
        break;
      case "eex":
        this.doEex();
        break;
      case "add":
        this.applyBinary(ops.add);
        break;
      case "sub":
        this.applyBinary(ops.sub);
        break;
      case "mul":
        this.applyBinary(ops.mul);
        break;
      case "div":
        this.applyBinary(ops.div);
        break;
      case "power":
        this.applyBinary(ops.power);
        break;
      case "sin":
        this.applyUnary((x) => ops.sin(x, this.settings.angleMode));
        break;
      case "cos":
        this.applyUnary((x) => ops.cos(x, this.settings.angleMode));
        break;
      case "tan":
        this.applyUnary((x) => ops.tan(x, this.settings.angleMode));
        break;
      case "angleMode":
        this.setAngleMode(command.mode);
        break;
      case "displayMode":
        this.pendingModeKey = command.mode;
        break;
      case "modeDigit":
        // Only meaningful while pendingModeKey is set; otherwise ignored.
        break;
    }
  }

  getDisplayState(): DisplayState {
    if (this.isError) {
      return { xLine: "Error", yLine: "", isError: true };
    }
    const xValue = this.entryInProgress
      ? this.currentEntryDisplayText()
      : formatNumber(this.stack.x, this.settings);
    const yLine = formatSecondary(this.stack.y);
    return { xLine: xValue, yLine, isError: false };
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  /** The FIX/SCI/ENG key that was pressed and is awaiting its decimal-place digit, if any. */
  getPendingDisplayMode(): DisplayMode | null {
    return this.pendingModeKey;
  }

  // --- Digit entry -------------------------------------------------------

  private beginEntryIfNeeded(): void {
    if (!this.entryInProgress) {
      this.stack.liftIfEnabled();
      this.entryInProgress = true;
      this.entryBuffer = "";
      this.exponentEntryActive = false;
      this.exponentBuffer = "";
      this.mantissaNegative = false;
      this.exponentNegative = false;
    }
  }

  private inputDigit(digit: string): void {
    this.beginEntryIfNeeded();
    if (this.exponentEntryActive) {
      // HP exponent field holds 2 digits.
      if (this.exponentBuffer.length < 2) {
        this.exponentBuffer += digit;
      }
    } else {
      this.entryBuffer += digit;
    }
    this.commitBufferToX();
  }

  private inputDecimalPoint(): void {
    this.beginEntryIfNeeded();
    if (this.exponentEntryActive) {
      return; // No decimal point in the exponent field.
    }
    if (!this.entryBuffer.includes(".")) {
      this.entryBuffer = this.entryBuffer === "" ? "0." : this.entryBuffer + ".";
    }
    this.commitBufferToX();
  }

  private doEex(): void {
    this.beginEntryIfNeeded();
    if (this.entryBuffer === "") {
      this.entryBuffer = "1";
    }
    this.exponentEntryActive = true;
    this.commitBufferToX();
  }

  private currentEntryDisplayText(): string {
    const mantissa = this.entryBuffer === "" ? "0" : this.entryBuffer;
    const signedMantissa = this.mantissaNegative ? `-${mantissa}` : mantissa;
    if (!this.exponentEntryActive) {
      return signedMantissa;
    }
    const exponent = this.exponentBuffer === "" ? "0" : this.exponentBuffer;
    const signedExponent = this.exponentNegative ? `-${exponent}` : exponent;
    return `${signedMantissa}E${signedExponent}`;
  }

  private commitBufferToX(): void {
    const text = this.currentEntryDisplayText();
    const parsed = Number(text.replace("E", "e"));
    this.stack.setX(Number.isFinite(parsed) ? parsed : 0);
  }

  private commitEntryIfNeeded(): void {
    if (this.entryInProgress) {
      this.commitBufferToX();
      this.entryInProgress = false;
    }
  }

  // --- Commands ------------------------------------------------------------

  private doEnter(): void {
    this.commitEntryIfNeeded();
    this.stack.duplicateXIntoY();
  }

  private doChs(): void {
    if (this.entryInProgress) {
      if (this.exponentEntryActive) {
        this.exponentNegative = !this.exponentNegative;
      } else {
        this.mantissaNegative = !this.mantissaNegative;
      }
      this.commitBufferToX();
    } else {
      this.stack.replaceX(-this.stack.x);
    }
  }

  private doClx(): void {
    this.stack.clearX();
    this.entryInProgress = false;
    this.entryBuffer = "";
    this.exponentEntryActive = false;
    this.exponentBuffer = "";
    this.mantissaNegative = false;
    this.exponentNegative = false;
  }

  private doClearAll(): void {
    this.stack.clearAll();
    this.entryInProgress = false;
    this.entryBuffer = "";
    this.exponentEntryActive = false;
    this.exponentBuffer = "";
    this.mantissaNegative = false;
    this.exponentNegative = false;
  }

  private applyBinary(fn: (y: number, x: number) => number | ReturnType<typeof ops.div>): void {
    this.commitEntryIfNeeded();
    const result = fn(this.stack.y, this.stack.x);
    if (isCalcError(result)) {
      this.isError = true;
      return;
    }
    this.stack.dropAndReplaceX(result);
  }

  private applyUnary(fn: (x: number) => number | ReturnType<typeof ops.sin>): void {
    this.commitEntryIfNeeded();
    const result = fn(this.stack.x);
    if (isCalcError(result)) {
      this.isError = true;
      return;
    }
    this.stack.replaceX(result);
  }

  private setAngleMode(mode: AngleMode): void {
    this.settings.angleMode = mode;
    saveSettings(this.settings);
  }

  private applyDisplayModeDigit(mode: DisplayMode, digit: string): void {
    const decimalPlaces = Number(digit);
    this.settings.displayMode = mode;
    this.settings.decimalPlaces = decimalPlaces;
    saveSettings(this.settings);
  }
}
