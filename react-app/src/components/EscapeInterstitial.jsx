import React, { useState, useEffect, useCallback } from 'react';
import { useDetection } from '../hooks/useDetection';
import { useEscapeStrategy } from '../hooks/useEscapeStrategy';

/* ------------------------------------------------------------------ */
/*  Inline styles                                                      */
/* ------------------------------------------------------------------ */

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #0a0a0a 0%, #0f0f23 40%, #1a1a2e 100%)',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ambientOrb2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '40px 28px 32px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
  },
  browserIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '-0.3px',
    lineHeight: '1.3',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: '1.5',
  },
  ctaButton: {
    width: '100%',
    padding: '16px 24px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
    letterSpacing: '0.2px',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  secondaryButton: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    marginTop: '12px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  instructionBox: {
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '14px',
    padding: '20px',
    marginTop: '16px',
  },
  instructionStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '14px',
  },
  stepNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.3)',
    color: '#a5b4fc',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
  },
  stepText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: '1.5',
  },
  highlightBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  loadingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'iab-spin 0.8s linear infinite',
  },
  successBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    color: '#4ade80',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 auto',
    textAlign: 'center',
  },
  copyFlash: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(34, 197, 94, 0.95)',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    zIndex: 9999,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    animation: 'iab-fadeInOut 1.5s ease forwards',
    pointerEvents: 'none',
  },
  whyToggle: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '12px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    margin: '0 auto',
    transition: 'color 0.2s ease',
  },
  whyContent: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '12px',
    fontSize: '13px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  debugToggle: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '11px',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    zIndex: 100,
  },
  debugPanel: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    maxHeight: '50vh',
    overflowY: 'auto',
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '16px',
    fontSize: '11px',
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    color: '#a5b4fc',
    zIndex: 200,
    WebkitOverflowScrolling: 'touch',
  },
  debugKey: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginRight: '8px',
  },
  debugValue: {
    color: '#c4b5fd',
  },
  debugTrue: {
    color: '#4ade80',
  },
  debugFalse: {
    color: '#f87171',
  },
  notIabCard: {
    textAlign: 'center',
  },
  checkmark: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '28px',
  },
  pendingCountdown: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '3px solid rgba(99, 102, 241, 0.3)',
    borderTopColor: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    animation: 'iab-spin 1s linear infinite',
  },
  strategyList: {
    marginTop: '16px',
  },
  strategyItem: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strategyName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  strategyReliability: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.35)',
    fontWeight: '500',
  },
};

/* ------------------------------------------------------------------ */
/*  Keyframe injection                                                 */
/* ------------------------------------------------------------------ */

const KEYFRAMES_ID = 'iab-escape-keyframes';

function injectKeyframes() {
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes iab-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes iab-fadeInOut {
      0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
      15%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      75%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
    }
    @keyframes iab-slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes iab-pulse {
      0%, 100% { box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3); }
      50%      { box-shadow: 0 4px 24px rgba(99, 102, 241, 0.5); }
    }
  `;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Helper: Browser icon                                               */
/* ------------------------------------------------------------------ */

function BrowserIcon({ platform }) {
  if (platform === 'ios') {
    // Safari compass icon
    return (
      <div style={styles.browserIcon}>
        <span role="img" aria-label="Safari">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" />
            <polygon points="16,6 20,14 16,26 12,18" fill="rgba(168,85,247,0.7)" />
            <polygon points="6,16 14,12 26,16 18,20" fill="rgba(99,102,241,0.5)" />
            <circle cx="16" cy="16" r="2" fill="#fff" />
          </svg>
        </span>
      </div>
    );
  }
  if (platform === 'android') {
    // Chrome icon approximation
    return (
      <div style={styles.browserIcon}>
        <span role="img" aria-label="Chrome">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="6" fill="rgba(99,102,241,0.4)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <path d="M16 10 L26 10 L21 18Z" fill="rgba(239,68,68,0.5)" />
            <path d="M21 18 L26 28 L16 22Z" fill="rgba(34,197,94,0.5)" />
            <path d="M16 22 L6 28 L11 18Z" fill="rgba(234,179,8,0.5)" />
          </svg>
        </span>
      </div>
    );
  }
  // Generic globe
  return (
    <div style={styles.browserIcon}>
      <span role="img" aria-label="Browser">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" />
          <ellipse cx="16" cy="16" rx="8" ry="13" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />
          <line x1="3" y1="16" x2="29" y2="16" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
          <line x1="16" y1="3" x2="16" y2="29" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
        </svg>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function EscapeInterstitial({ config }) {
  const detection = useDetection();
  const escape = useEscapeStrategy(detection, config);
  const [showWhy, setShowWhy] = useState(false);
  const [showDebug, setShowDebug] = useState(config?.ui?.showDebug || false);
  const [showCopyFlash, setShowCopyFlash] = useState(false);
  const [showAllStrategies, setShowAllStrategies] = useState(false);

  useEffect(() => {
    injectKeyframes();
  }, []);

  // Auto-attempt on mount if configured
  useEffect(() => {
    if (detection && config?.behavior?.autoAttempt && detection.isInAppBrowser && escape.bestStrategy) {
      const timer = setTimeout(() => escape.attempt(), 400);
      return () => clearTimeout(timer);
    }
  }, [detection]);

  const handleCTA = useCallback(() => {
    escape.attempt();
  }, [escape]);

  const handleCopy = useCallback(async () => {
    escape.attempt('clipboardAndInstruct');
    setShowCopyFlash(true);
    setTimeout(() => setShowCopyFlash(false), 1500);
  }, [escape]);

  const handleStrategyClick = useCallback(
    (strategyName) => {
      escape.attempt(strategyName);
      if (strategyName === 'clipboardAndInstruct') {
        setShowCopyFlash(true);
        setTimeout(() => setShowCopyFlash(false), 1500);
      }
    },
    [escape]
  );

  const browserName = detection?.isIOS ? 'Safari' : detection?.isAndroid ? 'Chrome' : 'Browser';

  /* ---- Loading ---- */
  if (!detection) {
    return (
      <div style={styles.container}>
        <div style={styles.ambientOrb1} />
        <div style={styles.ambientOrb2} />
        <div style={styles.card}>
          <div style={{ ...styles.loadingSpinner, margin: '40px auto' }} />
          <p style={{ ...styles.subtitle, marginBottom: 0 }}>Detecting browser environment...</p>
        </div>
      </div>
    );
  }

  /* ---- Not in-app browser ---- */
  if (!detection.isInAppBrowser) {
    return (
      <div style={styles.container}>
        <div style={styles.ambientOrb1} />
        <div style={styles.ambientOrb2} />
        <div style={{ ...styles.card, ...styles.notIabCard }}>
          <div style={styles.checkmark}>
            <span style={{ color: '#4ade80' }}>&#10003;</span>
          </div>
          <h1 style={styles.title}>You're all set</h1>
          <p style={styles.subtitle}>
            You're already using a standard browser. No action needed.
          </p>
          <div style={styles.successBadge}>
            Detected: {detection.isSafari ? 'Safari' : detection.isChrome ? 'Chrome' : 'Standard Browser'}
          </div>
        </div>
        <DebugToggle show={showDebug} setShow={setShowDebug} detection={detection} escape={escape} config={config} />
      </div>
    );
  }

  /* ---- IAB Detected ---- */
  return (
    <div style={styles.container}>
      <div style={styles.ambientOrb1} />
      <div style={styles.ambientOrb2} />

      {showCopyFlash && <div style={styles.copyFlash}>Copied to clipboard</div>}

      <div style={{ ...styles.card, animation: 'iab-slideUp 0.4s ease' }}>
        <BrowserIcon platform={detection.platform} />

        {/* --- State: Idle / Ready --- */}
        {(escape.state === 'idle') && (
          <>
            <h1 style={styles.title}>Continue in {browserName}</h1>
            <p style={styles.subtitle}>
              {config?.ui?.message ||
                `${config?.ui?.brandName || 'This page'} works best in your default browser for full security and features.`}
            </p>

            <button
              style={{
                ...styles.ctaButton,
                animation: 'iab-pulse 2s ease-in-out infinite',
              }}
              onClick={handleCTA}
            >
              <span>Open in {browserName}</span>
              <span style={{ fontSize: '18px' }}>&rarr;</span>
            </button>

            {detection.hasClipboardApi && (
              <button style={styles.secondaryButton} onClick={handleCopy}>
                <span style={{ fontSize: '15px' }}>&#128203;</span>
                Copy link instead
              </button>
            )}

            {escape.strategies.length > 2 && (
              <>
                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span>or</span>
                  <div style={styles.dividerLine} />
                </div>

                <button
                  style={{ ...styles.secondaryButton, border: 'none', background: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}
                  onClick={() => setShowAllStrategies(!showAllStrategies)}
                >
                  {showAllStrategies ? 'Hide options' : 'More options'}
                </button>

                {showAllStrategies && (
                  <div style={styles.strategyList}>
                    {escape.strategies.map((s) => (
                      <div
                        key={s.name}
                        style={styles.strategyItem}
                        onClick={() => handleStrategyClick(s.name)}
                      >
                        <div>
                          <div style={styles.strategyName}>{friendlyName(s.name)}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                            {s.description}
                          </div>
                        </div>
                        <div style={styles.strategyReliability}>{Math.round(s.reliability * 100)}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* --- State: Attempting --- */}
        {escape.state === 'attempting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.loadingSpinner, margin: '0 auto 20px' }} />
            <h1 style={styles.title}>Opening {browserName}...</h1>
            <p style={styles.subtitle}>Launching secure browser, please wait.</p>
          </div>
        )}

        {/* --- State: Pending --- */}
        {escape.state === 'pending' && (
          <div style={{ textAlign: 'center' }}>
            <div style={styles.pendingCountdown} />
            <h1 style={styles.title}>Check for {browserName}</h1>
            <p style={styles.subtitle}>
              {browserName} should be opening. If nothing happened, try an alternative below.
            </p>
            <button style={styles.secondaryButton} onClick={handleCopy}>
              <span style={{ fontSize: '15px' }}>&#128203;</span>
              Copy link instead
            </button>
            <ManualInstructions detection={detection} />
          </div>
        )}

        {/* --- State: Manual --- */}
        {escape.state === 'manual' && (
          <div>
            <h1 style={styles.title}>Almost there</h1>
            {escape.lastResult?.instruction && (
              <div style={styles.instructionBox}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', margin: 0 }}>
                  {escape.lastResult.instruction}
                </p>
              </div>
            )}
            <ManualInstructions detection={detection} />
            <button style={{ ...styles.secondaryButton, marginTop: '16px' }} onClick={() => escape.reset()}>
              Try another method
            </button>
          </div>
        )}

        {/* --- State: Failed --- */}
        {escape.state === 'failed' && (
          <div>
            <h1 style={styles.title}>Open manually</h1>
            <p style={styles.subtitle}>
              Automatic methods didn't work. Use the steps below to open in {browserName}.
            </p>

            {detection.hasClipboardApi && (
              <button style={styles.ctaButton} onClick={handleCopy}>
                <span style={{ fontSize: '15px' }}>&#128203;</span>
                Copy link to clipboard
              </button>
            )}

            <ManualInstructions detection={detection} />

            <button
              style={{ ...styles.secondaryButton, marginTop: '16px' }}
              onClick={() => escape.reset()}
            >
              Start over
            </button>
          </div>
        )}

        {/* --- State: Succeeded --- */}
        {escape.state === 'succeeded' && (
          <div style={{ textAlign: 'center' }}>
            <div style={styles.checkmark}>
              <span style={{ color: '#4ade80' }}>&#10003;</span>
            </div>
            <h1 style={styles.title}>Opened in {browserName}</h1>
            <p style={styles.subtitle}>You can close this tab.</p>
          </div>
        )}

        {/* --- Why toggle (shown in idle, failed, manual states) --- */}
        {['idle', 'failed', 'manual'].includes(escape.state) && (
          <>
            <button style={styles.whyToggle} onClick={() => setShowWhy(!showWhy)}>
              <span style={{ transition: 'transform 0.2s', transform: showWhy ? 'rotate(90deg)' : 'rotate(0)', display: 'inline-block' }}>&#9654;</span>
              &nbsp;Why do I need to do this?
            </button>
            {showWhy && (
              <div style={styles.whyContent}>
                <p style={{ margin: '0 0 8px' }}>
                  <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Instagram's in-app browser</strong> has
                  limited functionality compared to Safari or Chrome:
                </p>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  <li style={{ marginBottom: '4px' }}>No access to saved passwords or autofill</li>
                  <li style={{ marginBottom: '4px' }}>Limited security features and extensions</li>
                  <li style={{ marginBottom: '4px' }}>Some features may not work correctly</li>
                  <li style={{ marginBottom: '4px' }}>No bookmarks or browsing history</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <DebugToggle show={showDebug} setShow={setShowDebug} detection={detection} escape={escape} config={config} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ManualInstructions({ detection }) {
  const isIOS = detection?.isIOS;
  const steps = isIOS
    ? [
        { icon: '\u2022\u2022\u2022', text: 'Tap the three dots in the top-right corner of Instagram' },
        { icon: null, text: <span>Select <span style={styles.highlightBox}>Open in Safari</span></span> },
        { icon: null, text: 'The page will reload in Safari with full features' },
      ]
    : [
        { icon: '\u22ee', text: 'Tap the three dots in the top-right corner of Instagram' },
        { icon: null, text: <span>Select <span style={styles.highlightBox}>Open in Chrome</span></span> },
        { icon: null, text: 'The page will reload in Chrome with full features' },
      ];

  return (
    <div style={styles.instructionBox}>
      <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '14px', fontWeight: '600' }}>
        Manual steps
      </p>
      {steps.map((step, i) => (
        <div key={i} style={{ ...styles.instructionStep, marginBottom: i === steps.length - 1 ? 0 : '14px' }}>
          <div style={styles.stepNumber}>{i + 1}</div>
          <div style={styles.stepText}>{step.text}</div>
        </div>
      ))}
    </div>
  );
}

function DebugToggle({ show, setShow, detection, escape, config }) {
  return (
    <>
      <button style={styles.debugToggle} onClick={() => setShow(!show)}>
        {show ? 'Hide Debug' : 'Debug'}
      </button>
      {show && (
        <div style={styles.debugPanel}>
          <div style={{ marginBottom: '12px', fontWeight: '700', fontSize: '12px', color: '#8b5cf6' }}>
            Detection Results
          </div>
          {detection &&
            Object.entries(detection).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '3px', lineHeight: '1.5' }}>
                <span style={styles.debugKey}>{key}:</span>
                <span
                  style={
                    value === true
                      ? styles.debugTrue
                      : value === false
                        ? styles.debugFalse
                        : styles.debugValue
                  }
                >
                  {typeof value === 'string' && value.length > 80
                    ? value.slice(0, 80) + '...'
                    : String(value)}
                </span>
              </div>
            ))}

          <div style={{ marginTop: '16px', marginBottom: '12px', fontWeight: '700', fontSize: '12px', color: '#8b5cf6' }}>
            Escape State
          </div>
          <div style={{ marginBottom: '3px' }}>
            <span style={styles.debugKey}>state:</span>
            <span style={styles.debugValue}>{escape.state}</span>
          </div>
          <div style={{ marginBottom: '3px' }}>
            <span style={styles.debugKey}>attemptCount:</span>
            <span style={styles.debugValue}>{escape.attemptCount}</span>
          </div>
          <div style={{ marginBottom: '3px' }}>
            <span style={styles.debugKey}>bestStrategy:</span>
            <span style={styles.debugValue}>{escape.bestStrategy?.name || 'none'}</span>
          </div>
          <div style={{ marginBottom: '3px' }}>
            <span style={styles.debugKey}>availableStrategies:</span>
            <span style={styles.debugValue}>{escape.strategies.map((s) => s.name).join(', ') || 'none'}</span>
          </div>
          {escape.lastResult && (
            <div style={{ marginBottom: '3px' }}>
              <span style={styles.debugKey}>lastResult:</span>
              <span style={styles.debugValue}>{JSON.stringify(escape.lastResult)}</span>
            </div>
          )}

          <div style={{ marginTop: '16px', marginBottom: '12px', fontWeight: '700', fontSize: '12px', color: '#8b5cf6' }}>
            Config
          </div>
          <div style={{ marginBottom: '3px', wordBreak: 'break-all' }}>
            <span style={styles.debugValue}>{JSON.stringify(config, null, 0)}</span>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function friendlyName(strategyName) {
  const map = {
    androidIntent: 'Chrome Intent',
    androidIntentGeneric: 'Browser Chooser',
    androidChromeScheme: 'Chrome Scheme',
    shareApi: 'Share to Browser',
    clipboardAndInstruct: 'Copy Link',
    manualMenuInstruction: 'Manual Instructions',
    windowOpen: 'Window Open',
    anchorBlank: 'New Tab Link',
  };
  return map[strategyName] || strategyName;
}
