import { useState, useCallback, useRef, useMemo } from 'react';
import { getStrategies, getBestStrategy } from '../lib/strategies';

/**
 * Custom hook for managing escape strategy execution.
 *
 * States: 'idle' | 'attempting' | 'pending' | 'manual' | 'failed' | 'succeeded'
 */
export function useEscapeStrategy(detection, config) {
  const [state, setState] = useState('idle');
  const [lastResult, setLastResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);
  const pendingTimerRef = useRef(null);

  const available = useMemo(() => {
    if (!detection) return [];
    return getStrategies(detection, config);
  }, [detection, config]);

  const bestStrategy = useMemo(() => {
    if (!detection) return null;
    return getBestStrategy(detection, config);
  }, [detection, config]);

  const attempt = useCallback(
    async (strategyKey) => {
      if (!detection) return;

      const targetUrl = config?.targetUrl || window.location.href;

      // Determine which strategy to use
      let strategy;
      if (strategyKey) {
        strategy = available.find((s) => s.name === strategyKey);
      } else {
        strategy = available[currentStrategyIndex] || null;
      }

      if (!strategy) {
        setState('failed');
        setLastResult({ success: false, method: null, error: 'No strategy available' });
        return;
      }

      setState('attempting');
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);

      if (config?.logging?.console) {
        console.log(`[IAB Escape] Attempting strategy: ${strategy.name} (attempt #${newCount})`);
      }

      try {
        const result = await strategy.execute(targetUrl, detection);
        setLastResult(result);

        if (result.instruction) {
          // Strategy requires manual user action
          setState('manual');
        } else if (result.success) {
          // Strategy fired - enter pending state with fallback timer
          setState('pending');

          // After fallback delay, assume it didn't work and escalate
          if (config?.ui?.progressiveEscalation) {
            if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
            pendingTimerRef.current = setTimeout(() => {
              // If we're still on this page, the escape likely failed
              const nextIndex = currentStrategyIndex + 1;
              if (nextIndex < available.length) {
                setCurrentStrategyIndex(nextIndex);
                setState('idle');
              } else {
                setState('failed');
              }
            }, config?.ui?.fallbackDelay || 3000);
          }
        } else {
          // Strategy explicitly failed - try next
          if (config?.ui?.progressiveEscalation) {
            const nextIndex = currentStrategyIndex + 1;
            if (nextIndex < available.length) {
              setCurrentStrategyIndex(nextIndex);
              setState('idle');
            } else {
              setState('failed');
            }
          } else {
            setState('failed');
          }
        }
      } catch (err) {
        setLastResult({ success: false, method: strategy.name, error: err.message });
        setState('failed');
      }
    },
    [detection, config, available, currentStrategyIndex, attemptCount]
  );

  const reset = useCallback(() => {
    setState('idle');
    setLastResult(null);
    setAttemptCount(0);
    setCurrentStrategyIndex(0);
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
  }, []);

  return {
    strategies: available,
    bestStrategy,
    currentStrategy: available[currentStrategyIndex] || null,
    attempt,
    reset,
    lastResult,
    attemptCount,
    state,
  };
}
