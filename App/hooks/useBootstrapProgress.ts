import { useEffect, useState } from 'react';

type Options = {
  fontsReady: boolean;
  authReady: boolean;
};

/**
 * Smooth bootstrap progress for the splash screen.
 * Creeps toward 92% while work is in flight, then completes when both phases finish.
 */
export function useBootstrapProgress({ fontsReady, authReady }: Options): number {
  const [progress, setProgress] = useState(0.08);

  useEffect(() => {
    if (fontsReady && authReady) {
      setProgress(1);
      return;
    }

    const ceiling = fontsReady ? 0.88 : 0.55;
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= ceiling) return current;
        const step = fontsReady ? 0.018 : 0.028;
        return Math.min(current + step, ceiling);
      });
    }, 140);

    return () => clearInterval(interval);
  }, [fontsReady, authReady]);

  useEffect(() => {
    if (fontsReady && progress < 0.58) {
      setProgress((current) => Math.max(current, 0.58));
    }
  }, [fontsReady, progress]);

  return progress;
}
