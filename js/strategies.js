// strategies.js - Instagram IAB Escape Strategies
// Each strategy attempts to move the user from IAB to system browser

(function(global) {
  'use strict';

  // Utility: create a temporary anchor and click it
  function clickLink(url, target) {
    var a = document.createElement('a');
    a.href = url;
    if (target) a.target = target;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { document.body.removeChild(a); }, 100);
  }

  var strategies = {

    androidIntent: {
      name: 'Android Intent (Chrome)',
      platforms: ['android'],
      reliability: 'medium',
      requiresUserGesture: true,
      description: 'Uses intent:// URI scheme to request Android open URL in Chrome',
      isAvailable: function(det) {
        return det.isAndroid && det.isInstagram;
      },
      execute: function(url, det) {
        // Build intent URL targeting Chrome
        // Format: intent://HOST/PATH#Intent;scheme=https;package=com.android.chrome;end
        var parsed;
        try {
          parsed = new URL(url);
        } catch(e) {
          return { success: false, error: 'Invalid URL' };
        }
        var intentUrl = 'intent://' + parsed.host + parsed.pathname + parsed.search + parsed.hash
          + '#Intent;scheme=' + parsed.protocol.replace(':', '')
          + ';package=com.android.chrome;end';

        try {
          window.location.href = intentUrl;
          return { success: 'pending', method: 'intent-chrome' };
        } catch(e) {
          return { success: false, error: e.message };
        }
      }
    },

    androidIntentGeneric: {
      name: 'Android Intent (Generic Browser)',
      platforms: ['android'],
      reliability: 'medium',
      requiresUserGesture: true,
      description: 'Uses intent:// without package to trigger Android chooser',
      isAvailable: function(det) {
        return det.isAndroid && det.isInstagram;
      },
      execute: function(url, det) {
        var parsed;
        try {
          parsed = new URL(url);
        } catch(e) {
          return { success: false, error: 'Invalid URL' };
        }
        var intentUrl = 'intent://' + parsed.host + parsed.pathname + parsed.search + parsed.hash
          + '#Intent;scheme=' + parsed.protocol.replace(':', '')
          + ';action=android.intent.action.VIEW;end';

        try {
          window.location.href = intentUrl;
          return { success: 'pending', method: 'intent-generic' };
        } catch(e) {
          return { success: false, error: e.message };
        }
      }
    },

    androidChromeScheme: {
      name: 'Chrome URL Scheme (Android)',
      platforms: ['android'],
      reliability: 'low',
      requiresUserGesture: true,
      description: 'Deprecated googlechrome:// scheme - may still work on some versions',
      isAvailable: function(det) {
        return det.isAndroid && det.isInstagram;
      },
      execute: function(url, det) {
        var chromeUrl = 'googlechrome://navigate?url=' + encodeURIComponent(url);

        try {
          window.location.href = chromeUrl;
          return { success: 'pending', method: 'chrome-scheme' };
        } catch(e) {
          return { success: false, error: e.message };
        }
      }
    },

    shareApi: {
      name: 'Web Share API',
      platforms: ['android', 'ios'],
      reliability: 'high',
      requiresUserGesture: true,
      description: 'Triggers native share sheet - user can choose browser from there',
      isAvailable: function(det) {
        return det.hasShareApi;
      },
      execute: function(url, det) {
        return navigator.share({
          title: document.title || 'Open in Browser',
          url: url
        }).then(function() {
          return { success: 'pending', method: 'share-api', note: 'User interacted with share sheet' };
        }).catch(function(e) {
          if (e.name === 'AbortError') {
            return { success: false, error: 'User cancelled share', recoverable: true };
          }
          return { success: false, error: e.message };
        });
      }
    },

    clipboardAndInstruct: {
      name: 'Clipboard Copy + Instruction',
      platforms: ['android', 'ios'],
      reliability: 'high',
      requiresUserGesture: true,
      description: 'Copies URL to clipboard and shows user instruction to paste in browser',
      isAvailable: function(det) {
        return det.hasClipboardApi;
      },
      execute: function(url, det) {
        return navigator.clipboard.writeText(url).then(function() {
          return {
            success: 'manual',
            method: 'clipboard',
            instruction: det.isIOS
              ? 'URL copied! Open Safari and paste in the address bar'
              : 'URL copied! Open Chrome and paste in the address bar'
          };
        }).catch(function(e) {
          // Fallback: use textarea hack
          try {
            var ta = document.createElement('textarea');
            ta.value = url;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return {
              success: 'manual',
              method: 'clipboard-fallback',
              instruction: 'URL copied! Open your browser and paste in the address bar'
            };
          } catch(e2) {
            return { success: false, error: 'Clipboard unavailable' };
          }
        });
      }
    },

    manualMenuInstruction: {
      name: 'Manual Menu Instruction',
      platforms: ['android', 'ios'],
      reliability: 'high',
      requiresUserGesture: false,
      description: 'Shows visual guide to use Instagram built-in "Open in Browser" option',
      isAvailable: function(det) {
        return det.isInstagram;
      },
      execute: function(url, det) {
        var instruction;
        if (det.isIOS) {
          instruction = 'Tap the \u2022\u2022\u2022 menu at the bottom right, then tap "Open in Safari"';
        } else {
          instruction = 'Tap the \u22ee menu at the top right, then tap "Open in Chrome" or "Open in browser"';
        }
        return Promise.resolve({
          success: 'manual',
          method: 'menu-instruction',
          instruction: instruction,
          showGuide: true
        });
      }
    },

    windowOpen: {
      name: 'window.open()',
      platforms: ['android', 'ios'],
      reliability: 'very-low',
      requiresUserGesture: true,
      description: 'Attempts window.open which may trigger external browser on some Android WebViews',
      isAvailable: function(det) {
        return det.isInAppBrowser;
      },
      execute: function(url, det) {
        try {
          var w = window.open(url, '_system');
          if (w) {
            return { success: 'pending', method: 'window-open', note: 'Window opened - may be same WebView' };
          } else {
            return { success: false, error: 'window.open returned null (blocked)' };
          }
        } catch(e) {
          return { success: false, error: e.message };
        }
      }
    },

    anchorBlank: {
      name: 'Anchor target=_blank',
      platforms: ['android', 'ios'],
      reliability: 'very-low',
      requiresUserGesture: true,
      description: 'Creates anchor with target=_blank - rarely escapes IAB but worth testing',
      isAvailable: function(det) {
        return det.isInAppBrowser;
      },
      execute: function(url, det) {
        clickLink(url, '_blank');
        return { success: 'pending', method: 'anchor-blank', note: 'Likely stays in IAB' };
      }
    },

    locationReplace: {
      name: 'location.replace()',
      platforms: ['android'],
      reliability: 'very-low',
      requiresUserGesture: false,
      description: 'Uses location.replace with intent URL - avoids history entry',
      isAvailable: function(det) {
        return det.isAndroid && det.isInstagram;
      },
      execute: function(url, det) {
        var parsed;
        try {
          parsed = new URL(url);
        } catch(e) {
          return { success: false, error: 'Invalid URL' };
        }
        var intentUrl = 'intent://' + parsed.host + parsed.pathname + parsed.search + parsed.hash
          + '#Intent;scheme=' + parsed.protocol.replace(':', '')
          + ';package=com.android.chrome;end';

        try {
          window.location.replace(intentUrl);
          return { success: 'pending', method: 'location-replace-intent' };
        } catch(e) {
          return { success: false, error: e.message };
        }
      }
    },

    iframeBust: {
      name: 'Hidden iframe scheme trigger',
      platforms: ['android'],
      reliability: 'very-low',
      requiresUserGesture: false,
      description: 'Creates hidden iframe with intent:// src - Android may process it',
      isAvailable: function(det) {
        return det.isAndroid && det.isInstagram;
      },
      execute: function(url, det) {
        var parsed;
        try {
          parsed = new URL(url);
        } catch(e) {
          return { success: false, error: 'Invalid URL' };
        }
        var intentUrl = 'intent://' + parsed.host + parsed.pathname + parsed.search + parsed.hash
          + '#Intent;scheme=' + parsed.protocol.replace(':', '')
          + ';package=com.android.chrome;end';

        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = intentUrl;
        document.body.appendChild(iframe);
        setTimeout(function() { document.body.removeChild(iframe); }, 2000);
        return { success: 'pending', method: 'iframe-intent' };
      }
    },

    // Experimental: chain through Google redirect
    googleRedirect: {
      name: 'Google Search Redirect',
      platforms: ['android', 'ios'],
      reliability: 'very-low',
      requiresUserGesture: true,
      description: 'Redirects through Google which may trigger "open in browser" behavior',
      isAvailable: function(det) {
        return det.isInAppBrowser;
      },
      execute: function(url, det) {
        var googleUrl = 'https://www.google.com/url?q=' + encodeURIComponent(url) + '&sa=D&source=web';
        window.location.href = googleUrl;
        return { success: 'pending', method: 'google-redirect', note: 'May trigger browser switch on some devices' };
      }
    },

    // Experimental: use mailto to break out then redirect
    schemeBounce: {
      name: 'Scheme Bounce (mailto)',
      platforms: ['android'],
      reliability: 'very-low',
      requiresUserGesture: true,
      description: 'Triggers a native scheme handler, hopes the return lands in browser context',
      isAvailable: function(det) {
        return det.isAndroid;
      },
      execute: function(url, det) {
        window.location.href = 'mailto:?subject=Open%20Link&body=' + encodeURIComponent(url);
        return { success: 'pending', method: 'scheme-bounce', note: 'Experimental - opens email client' };
      }
    }
  };

  // Get ordered strategies for a given detection result
  function getStrategies(det, config) {
    config = config || {};
    var ordered = [];
    var priority;

    if (det.isAndroid) {
      priority = [
        'androidIntent',
        'androidIntentGeneric',
        'androidChromeScheme',
        'shareApi',
        'clipboardAndInstruct',
        'manualMenuInstruction',
        'windowOpen',
        'locationReplace',
        'iframeBust',
        'anchorBlank',
        'googleRedirect',
        'schemeBounce'
      ];
    } else if (det.isIOS) {
      priority = [
        'shareApi',
        'clipboardAndInstruct',
        'manualMenuInstruction',
        'windowOpen',
        'anchorBlank',
        'googleRedirect'
      ];
    } else {
      priority = [
        'shareApi',
        'clipboardAndInstruct',
        'windowOpen',
        'anchorBlank'
      ];
    }

    for (var i = 0; i < priority.length; i++) {
      var key = priority[i];
      var s = strategies[key];
      if (!s) continue;

      // Check config flags
      if (config.disabled && config.disabled[key]) continue;
      if (config.forceStrategy && config.forceStrategy !== key) continue;

      // Check availability
      if (s.isAvailable(det)) {
        ordered.push({
          key: key,
          strategy: s
        });
      }
    }

    return ordered;
  }

  // Get the single best strategy
  function getBestStrategy(det, config) {
    var strats = getStrategies(det, config);
    return strats.length > 0 ? strats[0] : null;
  }

  global.IABStrategies = {
    strategies: strategies,
    getStrategies: getStrategies,
    getBestStrategy: getBestStrategy
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { strategies: strategies, getStrategies: getStrategies, getBestStrategy: getBestStrategy };
  }

})(typeof window !== 'undefined' ? window : this);
