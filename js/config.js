// config.js - Feature flags and configuration for IAB escape
(function(global) {
  'use strict';

  var defaultConfig = {
    // Target URL to open in external browser (defaults to current page)
    targetUrl: null, // null = use window.location.href

    // Strategy flags - disable specific strategies
    disabled: {
      // androidIntent: false,
      // androidIntentGeneric: false,
      // androidChromeScheme: false,
      // shareApi: false,
      // clipboardAndInstruct: false,
      // manualMenuInstruction: false,
      // windowOpen: false,
      // anchorBlank: false,
      // locationReplace: false,
      // iframeBust: false,
      // googleRedirect: false,
      // schemeBounce: false
    },

    // Force a specific strategy (for testing) - set to strategy key name
    forceStrategy: null,

    // UI Configuration
    ui: {
      // Show detection debug panel
      showDebug: false,
      // Theme: 'dark' or 'light'
      theme: 'dark',
      // Brand name shown in interstitial
      brandName: 'Our App',
      // Custom message
      message: null,
      // Show progressive escalation (try harder if first attempt fails)
      progressiveEscalation: true,
      // Auto-copy URL on page load (needs gesture on most browsers)
      autoCopyOnLoad: false,
      // Delay before showing fallback (ms)
      fallbackDelay: 3000,
    },

    // Logging configuration
    logging: {
      // Enable console logging
      console: true,
      // Beacon endpoint URL (POST events as JSON)
      beaconUrl: null,
      // Include user agent in logs
      includeUA: true,
    },

    // Behavior
    behavior: {
      // Auto-attempt best strategy without button click
      autoAttempt: false,
      // Maximum number of strategy attempts before showing manual fallback
      maxAttempts: 2,
      // Show "Open in Browser" instruction after N failed attempts
      showInstructionAfterAttempts: 1,
    }
  };

  function mergeConfig(base, overrides) {
    var result = {};
    for (var key in base) {
      if (base.hasOwnProperty(key)) {
        if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
          result[key] = mergeConfig(base[key], (overrides && overrides[key]) || {});
        } else {
          result[key] = (overrides && overrides.hasOwnProperty(key)) ? overrides[key] : base[key];
        }
      }
    }
    // Add any override keys not in base
    if (overrides) {
      for (var key in overrides) {
        if (overrides.hasOwnProperty(key) && !base.hasOwnProperty(key)) {
          result[key] = overrides[key];
        }
      }
    }
    return result;
  }

  global.IABConfig = {
    defaults: defaultConfig,
    create: function(overrides) {
      return mergeConfig(defaultConfig, overrides || {});
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { defaults: defaultConfig, create: global.IABConfig.create };
  }

})(typeof window !== 'undefined' ? window : this);
