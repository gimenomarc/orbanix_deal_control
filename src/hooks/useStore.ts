'use client';

import { useSyncExternalStore } from 'react';
import { store } from '@/lib/data/store';

export function useStore() {
  useSyncExternalStore(
    (onStoreChange) => store.subscribe(onStoreChange),
    () => store.getVersion(),
    () => 0
  );

  return store;
}
