import { useState, useEffect } from 'react';
import { detect } from '../lib/detect';

export function useDetection() {
  const [detection, setDetection] = useState(null);

  useEffect(() => {
    setDetection(detect());
  }, []);

  return detection;
}
