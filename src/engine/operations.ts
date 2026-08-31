// Pure math operations. No stack knowledge - operate purely on numbers and return either
// a number result or a CalcError sentinel (never throw), so calculator.ts can decide how
// to reflect failures in the display state.

import type { AngleMode } from "./commands.js";
import { toRadians } from "./angle-mode.js";
import { type CalcError, makeDivideByZeroError, makeDomainError } from "./errors.js";

export function add(y: number, x: number): number | CalcError {
  return y + x;
}

export function sub(y: number, x: number): number | CalcError {
  return y - x;
}

export function mul(y: number, x: number): number | CalcError {
  return y * x;
}

export function div(y: number, x: number): number | CalcError {
  if (x === 0) {
    return makeDivideByZeroError();
  }
  return y / x;
}

export function power(y: number, x: number): number | CalcError {
  const result = Math.pow(y, x);
  if (Number.isNaN(result)) {
    return makeDomainError();
  }
  return result;
}

export function sin(x: number, angleMode: AngleMode): number | CalcError {
  return Math.sin(toRadians(x, angleMode));
}

export function cos(x: number, angleMode: AngleMode): number | CalcError {
  return Math.cos(toRadians(x, angleMode));
}

export function tan(x: number, angleMode: AngleMode): number | CalcError {
  const result = Math.tan(toRadians(x, angleMode));
  if (!Number.isFinite(result)) {
    return makeDomainError();
  }
  return result;
}
