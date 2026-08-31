// DEG/RAD/GRAD conversion helpers. All trig operations internally use radians (Math.sin etc.),
// converting to/from the active angle mode at the boundary.

import type { AngleMode } from "./commands.js";

export function toRadians(value: number, mode: AngleMode): number {
  switch (mode) {
    case "DEG":
      return (value * Math.PI) / 180;
    case "GRAD":
      return (value * Math.PI) / 200;
    case "RAD":
      return value;
  }
}

export function fromRadians(value: number, mode: AngleMode): number {
  switch (mode) {
    case "DEG":
      return (value * 180) / Math.PI;
    case "GRAD":
      return (value * 200) / Math.PI;
    case "RAD":
      return value;
  }
}
