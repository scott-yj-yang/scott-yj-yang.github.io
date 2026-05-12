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
};

export const FIG2_PRESETS = [
  { label: "Amplification 1x (no recurrence)", hebbian_w: 0,    balanced_w: 0 },
  { label: "Amplification 3x",                 hebbian_w: 2/3,  balanced_w: 2.5 },
  { label: "Amplification 4x (paper default)", hebbian_w: 0.75, balanced_w: 4 * Math.sqrt(2 / 7) },
  { label: "Amplification 10x",                hebbian_w: 0.9,  balanced_w: 90 },
] as const;

export const FIG3_DEFAULT = {
  tau: 1,
  gain: 1,           // global multiplier on W
  modeIndex: 1,      // 1-indexed mode pair to seed
  tEnd: 5,
  dt: 0.01,
};
