// detect.js - Instagram In-App Browser & Environment Detection
// Research/hackathon project - adversarial browser escape testing

(function(global) {
  'use strict';

  function detect() {
    var ua = navigator.userAgent || '';
    var uaLower = ua.toLowerCase();

    // Instagram detection
    var isInstagramUA = /FBAN|FBAV|Instagram/i.test(ua);
    var hasInstagramBridge = typeof window.__igBridge !== 'undefined'
      || typeof window.InstagramJSBridge !== 'undefined';
    var isInstagram = isInstagramUA || hasInstagramBridge;

    // Facebook detection (similar WebView)
    var isFacebook = /FBAN|FBAV/i.test(ua) && !isInstagramUA;

    // OS detection
    var isAndroid = /Android/i.test(ua);
    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    var isMac = /Macintosh/i.test(ua) && 'ontouchend' in document; // iPad pretending to be Mac

    // iOS version
    var iosVersion = null;
    var iosMatch = ua.match(/OS (\d+)_(\d+)/);
    if (iosMatch) {
      iosVersion = parseFloat(iosMatch[1] + '.' + iosMatch[2]);
    }

    // Android version
    var androidVersion = null;
    var androidMatch = ua.match(/Android (\d+\.?\d*)/);
    if (androidMatch) {
      androidVersion = parseFloat(androidMatch[1]);
    }

    // WebView detection
    // Android WebView: "wv" in UA, or Version/X.X with Chrome
    var isAndroidWebView = isAndroid && (/\bwv\b/.test(ua) || (/Version\/\d/.test(ua) && /Chrome\//.test(ua)));

    // Chrome Custom Tab: has Chrome in UA but may have CCT marker
    // CCT detection is tricky - it looks like regular Chrome
    // One heuristic: CCT usually has the full Chrome version string
    var isChromeCustomTab = isAndroid && /Chrome\/\d/.test(ua) && !isAndroidWebView && isInstagram;

    // iOS WebView (WKWebView): no Safari in UA but has AppleWebKit
    var isIOSWebView = isIOS && /AppleWebKit/.test(ua) && !/Safari\//.test(ua);

    // Browser detection
    var isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
    var isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua);
    var isSamsungBrowser = /SamsungBrowser\//.test(ua);
    var isFirefox = /Firefox\//.test(ua);

    // In-app browser classification
    var iabType = 'none';
    if (isInstagram) {
      if (isAndroid) {
        iabType = isChromeCustomTab ? 'instagram-cct' : 'instagram-webview';
      } else if (isIOS) {
        iabType = 'instagram-wkwebview';
      } else {
        iabType = 'instagram-unknown';
      }
    } else if (isFacebook) {
      iabType = 'facebook';
    } else if (isAndroidWebView) {
      iabType = 'generic-webview';
    } else if (isIOSWebView) {
      iabType = 'generic-ios-webview';
    }

    // Capability detection
    var hasShareApi = typeof navigator.share === 'function';
    var hasClipboardApi = typeof navigator.clipboard !== 'undefined'
      && typeof navigator.clipboard.writeText === 'function';
    var hasBeaconApi = typeof navigator.sendBeacon === 'function';

    // Intent support (Android only)
    var supportsIntents = isAndroid; // WebView may or may not handle them

    // Standalone/PWA detection
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    return {
      // Raw
      userAgent: ua,

      // Platform
      isAndroid: isAndroid,
      isIOS: isIOS,
      isMac: isMac,
      iosVersion: iosVersion,
      androidVersion: androidVersion,

      // Instagram
      isInstagram: isInstagram,
      isInstagramUA: isInstagramUA,
      hasInstagramBridge: hasInstagramBridge,
      isFacebook: isFacebook,

      // WebView type
      isAndroidWebView: isAndroidWebView,
      isChromeCustomTab: isChromeCustomTab,
      isIOSWebView: isIOSWebView,
      iabType: iabType,

      // Browser
      isChrome: isChrome,
      isSafari: isSafari,
      isSamsungBrowser: isSamsungBrowser,
      isFirefox: isFirefox,

      // Capabilities
      hasShareApi: hasShareApi,
      hasClipboardApi: hasClipboardApi,
      hasBeaconApi: hasBeaconApi,
      supportsIntents: supportsIntents,
      isStandalone: isStandalone,

      // Summary
      isInAppBrowser: iabType !== 'none',
      platform: isAndroid ? 'android' : isIOS ? 'ios' : 'other',

      // Debug string
      summary: function() {
        return [
          'Platform: ' + (isAndroid ? 'Android ' + androidVersion : isIOS ? 'iOS ' + iosVersion : 'Other'),
          'IAB: ' + iabType,
          'Instagram: ' + isInstagram,
          'Share API: ' + hasShareApi,
          'Clipboard: ' + hasClipboardApi,
          'Standalone: ' + isStandalone
        ].join(' | ');
      }
    };
  }

  global.IABDetect = { detect: detect };

  // Also export as module if supported
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { detect: detect };
  }

})(typeof window !== 'undefined' ? window : this);
