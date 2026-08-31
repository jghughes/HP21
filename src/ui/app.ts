// Bootstraps the calculator: wires the engine to the keypad, keyboard input, and display views.

import { Calculator } from "../engine/calculator.js";
import { renderKeypad, updateActiveAngleMode, updateActiveDisplayMode } from "./keypad.js";
import { renderDisplay } from "./display-view.js";
import { mapKeyboardEvent } from "./keyboard-input.js";
import type { Command } from "../engine/commands.js";

function requireElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Required element #${id} not found`);
  }
  return el as T;
}

function main(): void {
  const calculator = new Calculator();

  const displayEl = requireElement<HTMLElement>("display");
  const xLineEl = requireElement<HTMLElement>("display-x");
  const yLineEl = requireElement<HTMLElement>("display-y");
  const keypadEl = requireElement<HTMLElement>("keypad");

  function update(): void {
    renderDisplay({ displayEl, xLineEl, yLineEl }, calculator.getDisplayState());
    const settings = calculator.getSettings();
    updateActiveAngleMode(keypadEl, settings.angleMode);
    updateActiveDisplayMode(keypadEl, settings.displayMode, calculator.getPendingDisplayMode());
  }

  function handleCommand(command: Command): void {
    calculator.execute(command);
    update();
  }

  renderKeypad(keypadEl, handleCommand);

  window.addEventListener("keydown", (event) => {
    const command = mapKeyboardEvent(event);
    if (command) {
      event.preventDefault();
      handleCommand(command);
    }
  });

  update();
}

main();
