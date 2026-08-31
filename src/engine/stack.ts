// Four-register RPN stack (X, Y, Z, T) with HP-style automatic stack lift.
//
// Stack lift rules (see project spec):
// - liftDisabled starts true right after ENTER so the next digit entry overwrites X
//   instead of lifting the stack (X was already duplicated into Y by ENTER).
// - Binary operations always drop the stack after computing (Z -> Y, T stays/duplicates)
//   and re-arm the lift (liftDisabled = false) for the next digit entry.
// - liftIfEnabled() is called by the calculator immediately before a *new* digit entry
//   begins (i.e., when entryInProgress transitions from false to true).

export class Stack {
  private _x = 0;
  private _y = 0;
  private _z = 0;
  private _t = 0;
  private _liftDisabled = false;

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get z(): number {
    return this._z;
  }

  get t(): number {
    return this._t;
  }

  get liftDisabled(): boolean {
    return this._liftDisabled;
  }

  /** Directly overwrite X without touching Y/Z/T or lift state (used while digit-entering). */
  setX(value: number): void {
    this._x = value;
  }

  /** Lifts the stack (X->Y->Z->T, old T dropped) only if lift is currently enabled. */
  liftIfEnabled(): void {
    if (this._liftDisabled) {
      return;
    }
    this._t = this._z;
    this._z = this._y;
    this._y = this._x;
  }

  enableLift(): void {
    this._liftDisabled = false;
  }

  disableLift(): void {
    this._liftDisabled = true;
  }

  /** ENTER: duplicate X into Y (lifting Z/T), then disable the next auto-lift. */
  duplicateXIntoY(): void {
    this._t = this._z;
    this._z = this._y;
    this._y = this._x;
    this._liftDisabled = true;
  }

  /** Binary operation result: replace X with `result`, drop the stack (Z->Y, T self-duplicates). */
  dropAndReplaceX(result: number): void {
    this._x = result;
    this._y = this._z;
    this._z = this._t;
    this._liftDisabled = false;
  }

  /** Unary operation result: replace X only, leave Y/Z/T and lift state untouched. */
  replaceX(result: number): void {
    this._x = result;
  }

  /** Roll down: circular rotate X<-Y<-Z<-T<-X. */
  rollDown(): void {
    const oldX = this._x;
    this._x = this._y;
    this._y = this._z;
    this._z = this._t;
    this._t = oldX;
  }

  swapXY(): void {
    const oldX = this._x;
    this._x = this._y;
    this._y = oldX;
  }

  clearX(): void {
    this._x = 0;
  }

  clearAll(): void {
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._t = 0;
    this._liftDisabled = false;
  }
}
