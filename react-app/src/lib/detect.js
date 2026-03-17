export function detect() {
  const ua = navigator.userAgent || '';

  const isInstagramUA = /FBAN|FBAV|Instagram/i.test(ua);
  const hasInstagramBridge = typeof window.__igBridge !== 'undefined' || typeof window.InstagramJSBridge !== 'undefined';
  const isInstagram = isInstagramUA || hasInstagramBridge;
  const isFacebook = /FBAN|FBAV/i.test(ua) && !isInstagramUA;

  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  let iosVersion = null;
  const iosMatch = ua.match(/OS (\d+)_(\d+)/);
  if (iosMatch) iosVersion = parseFloat(iosMatch[1] + '.' + iosMatch[2]);

  let androidVersion = null;
  const androidMatch = ua.match(/Android (\d+\.?\d*)/);
  if (androidMatch) androidVersion = parseFloat(androidMatch[1]);

  const isAndroidWebView = isAndroid && (/\bwv\b/.test(ua) || (/Version\/\d/.test(ua) && /Chrome\//.test(ua)));
  const isChromeCustomTab = isAndroid && /Chrome\/\d/.test(ua) && !isAndroidWebView && isInstagram;
  const isIOSWebView = isIOS && /AppleWebKit/.test(ua) && !/Safari\//.test(ua);

  const isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
  const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua);

  let iabType = 'none';
  if (isInstagram) {
    if (isAndroid) iabType = isChromeCustomTab ? 'instagram-cct' : 'instagram-webview';
    else if (isIOS) iabType = 'instagram-wkwebview';
    else iabType = 'instagram-unknown';
  } else if (isFacebook) {
    iabType = 'facebook';
  } else if (isAndroidWebView) {
    iabType = 'generic-webview';
  } else if (isIOSWebView) {
    iabType = 'generic-ios-webview';
  }

  const hasShareApi = typeof navigator.share === 'function';
  const hasClipboardApi = typeof navigator.clipboard !== 'undefined' && typeof navigator.clipboard.writeText === 'function';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  return {
    userAgent: ua,
    isAndroid, isIOS, iosVersion, androidVersion,
    isInstagram, isInstagramUA, hasInstagramBridge, isFacebook,
    isAndroidWebView, isChromeCustomTab, isIOSWebView, iabType,
    isChrome, isSafari,
    hasShareApi, hasClipboardApi, isStandalone,
    isInAppBrowser: iabType !== 'none',
    platform: isAndroid ? 'android' : isIOS ? 'ios' : 'other',
  };
}
