export const defaultConfig = {
  targetUrl: null,
  disabled: {},
  forceStrategy: null,
  ui: {
    showDebug: false,
    theme: 'dark',
    brandName: 'Our App',
    message: null,
    progressiveEscalation: true,
    fallbackDelay: 3000,
  },
  logging: { console: true, beaconUrl: null },
  behavior: { autoAttempt: false, maxAttempts: 2, showInstructionAfterAttempts: 1 },
};

export function createConfig(overrides = {}) {
  return deepMerge(defaultConfig, overrides);
}

function deepMerge(base, overrides) {
  const result = {};
  for (const key of Object.keys(base)) {
    if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key], overrides[key] || {});
    } else {
      result[key] = key in overrides ? overrides[key] : base[key];
    }
  }
  for (const key of Object.keys(overrides)) {
    if (!(key in base)) result[key] = overrides[key];
  }
  return result;
}
