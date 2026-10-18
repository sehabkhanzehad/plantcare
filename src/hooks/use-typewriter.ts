import { useEffect, useState } from 'react';

import { TYPEWRITER_MS_PER_CHAR } from '@/lib/typewriter';

export function useTypewriter(
  text: string,
  enabled: boolean,
  msPerChar = TYPEWRITER_MS_PER_CHAR,
) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;

    let index = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        setDone(true);
        return;
      }
      timer = setTimeout(tick, msPerChar);
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before timed typewriter ticks
    setDisplayed('');
    setDone(false);
    timer = setTimeout(tick, msPerChar);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enabled, msPerChar, text]);

  if (!enabled) {
    return { displayed: text, done: true };
  }

  return { displayed, done };
}
