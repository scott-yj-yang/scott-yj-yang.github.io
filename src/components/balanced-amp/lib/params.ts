// All parameters match Murphy & Miller (2009) figure captions exactly.
// Time is in units of tau (membrane time constant) unless otherwise noted.

export const FIG1_DEFAULT = {
  w: 4 * Math.sqrt(2 / 7),  // ~2.138
  kI: 1.1,
  tau: 1,
  rE0: 1,
  rI0: 0,
  tEnd: 5,
  dt: 0.005,
} as const;

export const FIG2_HEBBIAN_DEFAULT = {
  w: 0.75,
  tau: 1,
  r0: 1,
  tEnd: 5,
  dt: 0.005,
} as const;

export const FIG2_PRESETS = [
  { label: "Amplification 1x (no recurrence)", hebbianW: 0,    balancedW: 0 },
  { label: "Amplification 3x",                 hebbianW: 2/3,  balancedW: 2.5 },
  { label: "Amplification 4x (paper default)", hebbianW: 0.75, balancedW: 4 * Math.sqrt(2 / 7) },
  { label: "Amplification 10x",                hebbianW: 0.9,  balancedW: 90 },
] as const;

export const FIG3_DEFAULT = {
  tau: 1,
  gain: 1,           // global multiplier on W
  modeIndex: 1,      // 1-indexed mode pair to seed
  tEnd: 5,
  dt: 0.01,
} as const;
