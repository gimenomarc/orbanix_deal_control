'use client';

import * as React from 'react';

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  listenEscape = true
): React.RefObject<T | null> {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const handleEvent = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains((event.target as Node) || null)) {
        return;
      }
      handler();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (listenEscape && event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('mousedown', handleEvent);
    document.addEventListener('touchstart', handleEvent);
    if (listenEscape) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleEvent);
      document.removeEventListener('touchstart', handleEvent);
      if (listenEscape) {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [handler, listenEscape]);

  return ref;
}
