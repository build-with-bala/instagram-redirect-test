import React, { useMemo } from 'react';
import { createConfig } from './lib/config';
import EscapeInterstitial from './components/EscapeInterstitial';

function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const overrides = {};

  if (params.has('debug')) {
    overrides.ui = overrides.ui || {};
    overrides.ui.showDebug = params.get('debug') === '1' || params.get('debug') === 'true';
  }

  if (params.has('force')) {
    overrides.forceStrategy = params.get('force');
  }

  if (params.has('brand')) {
    overrides.ui = overrides.ui || {};
    overrides.ui.brandName = params.get('brand');
  }

  if (params.has('url')) {
    overrides.targetUrl = params.get('url');
  }

  if (params.has('theme')) {
    overrides.ui = overrides.ui || {};
    overrides.ui.theme = params.get('theme');
  }

  if (params.has('auto')) {
    overrides.behavior = overrides.behavior || {};
    overrides.behavior.autoAttempt = params.get('auto') === '1' || params.get('auto') === 'true';
  }

  if (params.has('message')) {
    overrides.ui = overrides.ui || {};
    overrides.ui.message = params.get('message');
  }

  return overrides;
}

export default function App() {
  const config = useMemo(() => {
    const queryOverrides = parseQueryParams();
    return createConfig(queryOverrides);
  }, []);

  return <EscapeInterstitial config={config} />;
}
