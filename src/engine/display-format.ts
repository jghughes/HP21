// Formats a numeric X/Y register value for display according to the active Settings
// (FIX/SCI/ENG mode and decimal-place count), plus a DisplayState shape used by the UI.

import type { Settings } from "./settings.js";

export interface DisplayState {
  xLine: string;
  yLine: string;
  isError: boolean;
}

const MAX_SIGNIFICANT_DIGITS = 10;
const MAX_MAGNITUDE = 9.999999999e99;

/** Compact fixed-decimal formatting for the secondary Y line, matching the primary line's decimal-place setting. */
export function formatSecondary(value: number, settings: Settings): string {
  return formatFixed(value, settings.decimalPlaces);
}

export function formatNumber(value: number, settings: Settings): string {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  if (Math.abs(value) > MAX_MAGNITUDE) {
    const clamped = value < 0 ? -MAX_MAGNITUDE : MAX_MAGNITUDE;
    return formatScientific(clamped, 9);
  }

  switch (settings.displayMode) {
    case "FIX":
      return formatFixWithOverflow(value, settings.decimalPlaces);
    case "SCI":
      return formatScientific(value, settings.decimalPlaces);
    case "ENG":
      return formatEngineering(value, settings.decimalPlaces);
  }
}

function formatFixed(value: number, decimalPlaces: number): string {
  if (value === 0) {
    return (0).toFixed(decimalPlaces);
  }
  return value.toFixed(decimalPlaces);
}

/** FIX mode, but falls back to SCI automatically if the fixed form would overflow the display width. */
function formatFixWithOverflow(value: number, decimalPlaces: number): string {
  if (value === 0) {
    return formatFixed(0, decimalPlaces);
  }
  const fixed = formatFixed(value, decimalPlaces);
  const significantDigitCount = fixed.replace(/[^0-9]/g, "").replace(/^0+/, "").length || 1;
  if (significantDigitCount > MAX_SIGNIFICANT_DIGITS) {
    return formatScientific(value, decimalPlaces);
  }
  return fixed;
}

function formatScientific(value: number, decimalPlaces: number): string {
  if (value === 0) {
    return `${(0).toFixed(decimalPlaces)}E+00`;
  }
  const exponential = value.toExponential(decimalPlaces);
  const [mantissa, exponent] = exponential.split("e");
  const exponentValue = Number(exponent);
  const sign = exponentValue < 0 ? "-" : "+";
  const exponentDigits = String(Math.abs(exponentValue)).padStart(2, "0");
  return `${mantissa}E${sign}${exponentDigits}`;
}

function formatEngineering(value: number, decimalPlaces: number): string {
  if (value === 0) {
    return `${(0).toFixed(decimalPlaces)}E+00`;
  }
  const sign = value < 0 ? -1 : 1;
  const absValue = Math.abs(value);
  const rawExponent = Math.floor(Math.log10(absValue));
  let engExponent = Math.floor(rawExponent / 3) * 3;
  let mantissa = absValue / Math.pow(10, engExponent);

  // Guard against floating point edge cases pushing mantissa out of [1,1000).
  if (mantissa >= 1000) {
    mantissa /= 1000;
    engExponent += 3;
  } else if (mantissa < 1) {
    mantissa *= 1000;
    engExponent -= 3;
  }

  const mantissaStr = (sign * mantissa).toFixed(decimalPlaces);
  const expSign = engExponent < 0 ? "-" : "+";
  const expDigits = String(Math.abs(engExponent)).padStart(2, "0");
  return `${mantissaStr}E${expSign}${expDigits}`;
}
