// Sentinel error type returned by operations instead of thrown, so the calculator
// can detect a failed computation and switch the display to an error state.

export type CalcErrorKind = "divideByZero" | "domainError";

export interface CalcError {
  readonly kind: CalcErrorKind;
}

export function isCalcError(value: unknown): value is CalcError {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    (value.kind === "divideByZero" || value.kind === "domainError")
  );
}

export function makeDivideByZeroError(): CalcError {
  return { kind: "divideByZero" };
}

export function makeDomainError(): CalcError {
  return { kind: "domainError" };
}
