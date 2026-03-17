/**
 * Escape strategies for breaking out of Instagram's in-app browser.
 * Each strategy targets a specific platform/mechanism.
 */

const strategies = {
  androidIntent: {
    name: 'androidIntent',
    platforms: ['android'],
    reliability: 0.85,
    requiresUserGesture: true,
    description: 'Opens URL via Android intent targeting Chrome browser',
    isAvailable(detection) {
      return detection.isAndroid && detection.isInAppBrowser;
    },
    execute(url, detection) {
      return new Promise((resolve) => {
        try {
          const intentUrl =
            `intent://${url.replace(/^https?:\/\//, '')}#Intent;` +
            `scheme=https;` +
            `package=com.android.chrome;` +
            `action=android.intent.action.VIEW;` +
            `end`;
          window.location.href = intentUrl;
          // Intent fires async; we can't truly know if it worked
          setTimeout(() => {
            resolve({ success: true, method: 'androidIntent', instruction: null });
          }, 500);
        } catch (err) {
          resolve({ success: false, method: 'androidIntent', error: err.message });
        }
      });
    },
  },

  androidIntentGeneric: {
    name: 'androidIntentGeneric',
    platforms: ['android'],
    reliability: 0.7,
    requiresUserGesture: true,
    description: 'Opens URL via Android intent without specifying a browser (triggers chooser)',
    isAvailable(detection) {
      return detection.isAndroid && detection.isInAppBrowser;
    },
    execute(url, detection) {
      return new Promise((resolve) => {
        try {
          const intentUrl =
            `intent://${url.replace(/^https?:\/\//, '')}#Intent;` +
            `scheme=https;` +
            `action=android.intent.action.VIEW;` +
            `end`;
          window.location.href = intentUrl;
          setTimeout(() => {
            resolve({ success: true, method: 'androidIntentGeneric', instruction: null });
          }, 500);
        } catch (err) {
          resolve({ success: false, method: 'androidIntentGeneric', error: err.message });
        }
      });
    },
  },

  androidChromeScheme: {
    name: 'androidChromeScheme',
    platforms: ['android'],
    reliability: 0.4,
    requiresUserGesture: true,
    description: 'Opens URL via googlechrome:// scheme (deprecated, limited support)',
    isAvailable(detection) {
      return detection.isAndroid && detection.isInAppBrowser;
    },
    execute(url, detection) {
      return new Promise((resolve) => {
        try {
          const chromeUrl = url.replace(/^https?:\/\//, 'googlechrome://navigate?url=https://');
          window.location.href = chromeUrl;
          setTimeout(() => {
            resolve({ success: true, method: 'androidChromeScheme', instruction: null });
          }, 800);
        } catch (err) {
          resolve({ success: false, method: 'androidChromeScheme', error: err.message });
        }
      });
    },
  },

  shareApi: {
    name: 'shareApi',
    platforms: ['android', 'ios', 'other'],
    reliability: 0.75,
    requiresUserGesture: true,
    description: 'Uses Web Share API to share URL to external browser or app',
    isAvailable(detection) {
      return detection.hasShareApi;
    },
    execute(url, detection) {
      return new Promise(async (resolve) => {
        try {
          await navigator.share({
            title: document.title || 'Open in Browser',
            url: url,
          });
          resolve({ success: true, method: 'shareApi', instruction: 'Select your browser from the share menu to continue.' });
        } catch (err) {
          if (err.name === 'AbortError') {
            resolve({ success: false, method: 'shareApi', error: 'Share cancelled by user' });
          } else {
            resolve({ success: false, method: 'shareApi', error: err.message });
          }
        }
      });
    },
  },

  clipboardAndInstruct: {
    name: 'clipboardAndInstruct',
    platforms: ['android', 'ios', 'other'],
    reliability: 0.6,
    requiresUserGesture: false,
    description: 'Copies URL to clipboard and instructs user to paste in browser',
    isAvailable(detection) {
      return detection.hasClipboardApi;
    },
    execute(url, detection) {
      return new Promise(async (resolve) => {
        try {
          await navigator.clipboard.writeText(url);
          const browserName = detection.isIOS ? 'Safari' : detection.isAndroid ? 'Chrome' : 'your browser';
          resolve({
            success: true,
            method: 'clipboardAndInstruct',
            instruction: `Link copied! Open ${browserName} and paste the URL in the address bar.`,
          });
        } catch (err) {
          // Fallback: create a temporary input for older browsers
          try {
            const input = document.createElement('input');
            input.setAttribute('value', url);
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            input.setSelectionRange(0, url.length);
            document.execCommand('copy');
            document.body.removeChild(input);
            const browserName = detection.isIOS ? 'Safari' : detection.isAndroid ? 'Chrome' : 'your browser';
            resolve({
              success: true,
              method: 'clipboardAndInstruct',
              instruction: `Link copied! Open ${browserName} and paste the URL in the address bar.`,
            });
          } catch (fallbackErr) {
            resolve({ success: false, method: 'clipboardAndInstruct', error: fallbackErr.message });
          }
        }
      });
    },
  },

  manualMenuInstruction: {
    name: 'manualMenuInstruction',
    platforms: ['android', 'ios', 'other'],
    reliability: 0.9,
    requiresUserGesture: false,
    description: 'Guides user to use Instagram\'s built-in "Open in Browser" menu option',
    isAvailable(detection) {
      return detection.isInstagram;
    },
    execute(url, detection) {
      return new Promise((resolve) => {
        let instruction;
        if (detection.isIOS) {
          instruction =
            'Tap the three dots (\u2022\u2022\u2022) in the top-right corner of Instagram, then select "Open in Safari".';
        } else if (detection.isAndroid) {
          instruction =
            'Tap the three dots (\u22ee) in the top-right corner of Instagram, then select "Open in Chrome".';
        } else {
          instruction =
            'Look for the menu icon (three dots) at the top of the screen, then select "Open in Browser".';
        }
        resolve({
          success: true,
          method: 'manualMenuInstruction',
          instruction,
        });
      });
    },
  },

  windowOpen: {
    name: 'windowOpen',
    platforms: ['android', 'ios', 'other'],
    reliability: 0.2,
    requiresUserGesture: true,
    description: 'Attempts to open URL via window.open (low reliability in IABs)',
    isAvailable() {
      return true;
    },
    execute(url, detection) {
      return new Promise((resolve) => {
        try {
          const w = window.open(url, '_system');
          if (w) {
            resolve({ success: true, method: 'windowOpen', instruction: null });
          } else {
            resolve({ success: false, method: 'windowOpen', error: 'Popup blocked' });
          }
        } catch (err) {
          resolve({ success: false, method: 'windowOpen', error: err.message });
        }
      });
    },
  },

  anchorBlank: {
    name: 'anchorBlank',
    platforms: ['android', 'ios', 'other'],
    reliability: 0.15,
    requiresUserGesture: true,
    description: 'Creates and clicks an anchor with target="_blank" (very low reliability)',
    isAvailable() {
      return true;
    },
    execute(url, detection) {
      return new Promise((resolve) => {
        try {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => {
            resolve({ success: true, method: 'anchorBlank', instruction: null });
          }, 300);
        } catch (err) {
          resolve({ success: false, method: 'anchorBlank', error: err.message });
        }
      });
    },
  },
};

/**
 * Returns an ordered list of available strategies for the current environment.
 */
export function getStrategies(detection, config = {}) {
  const disabled = config.disabled || {};

  // Platform-specific ordering
  let order;
  if (detection.isAndroid) {
    order = [
      'androidIntent',
      'androidIntentGeneric',
      'shareApi',
      'androidChromeScheme',
      'clipboardAndInstruct',
      'manualMenuInstruction',
      'windowOpen',
      'anchorBlank',
    ];
  } else if (detection.isIOS) {
    order = [
      'shareApi',
      'clipboardAndInstruct',
      'manualMenuInstruction',
      'windowOpen',
      'anchorBlank',
    ];
  } else {
    order = [
      'shareApi',
      'clipboardAndInstruct',
      'manualMenuInstruction',
      'windowOpen',
      'anchorBlank',
    ];
  }

  return order
    .filter((key) => !disabled[key])
    .filter((key) => strategies[key] && strategies[key].isAvailable(detection))
    .map((key) => strategies[key]);
}

/**
 * Returns the single best strategy for the current environment.
 */
export function getBestStrategy(detection, config = {}) {
  if (config.forceStrategy && strategies[config.forceStrategy]) {
    return strategies[config.forceStrategy];
  }
  const available = getStrategies(detection, config);
  return available.length > 0 ? available[0] : null;
}

export { strategies };
