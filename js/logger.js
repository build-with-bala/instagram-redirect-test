// logger.js - Event instrumentation for IAB escape tracking
(function(global) {
  'use strict';

  function createLogger(config) {
    config = config || {};
    var events = [];
    var sessionId = 'iab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    function log(eventName, data) {
      var entry = {
        sessionId: sessionId,
        event: eventName,
        timestamp: Date.now(),
        data: data || {}
      };

      if (config.includeUA) {
        entry.userAgent = navigator.userAgent;
      }

      events.push(entry);

      if (config.console) {
        console.log('[IAB-Escape]', eventName, data);
      }

      // Fire beacon if configured
      if (config.beaconUrl) {
        try {
          if (navigator.sendBeacon) {
            navigator.sendBeacon(config.beaconUrl, JSON.stringify(entry));
          } else {
            // Fallback: image pixel
            var img = new Image();
            img.src = config.beaconUrl + '?d=' + encodeURIComponent(JSON.stringify(entry));
          }
        } catch(e) {
          // Silent fail for logging
        }
      }

      return entry;
    }

    function getEvents() {
      return events.slice();
    }

    function getSessionId() {
      return sessionId;
    }

    return {
      log: log,
      getEvents: getEvents,
      getSessionId: getSessionId
    };
  }

  global.IABLogger = { create: createLogger };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { create: createLogger };
  }

})(typeof window !== 'undefined' ? window : this);
