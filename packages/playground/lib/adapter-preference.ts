import type { AdapterId } from './adapter-examples';

import { ref } from 'vue';

import { ADAPTER_LABELS } from './adapter-examples';

const STORAGE_KEY = 'headless-components:adapter';

/**
 * One module-level ref shared by every example, so choosing an adapter in one
 * card switches all of them. Persisted to localStorage; loaded after mount to
 * keep SSR and the first client render identical.
 */
const selectedAdapter = ref<AdapterId>('vue');
let loaded = false;

export function useAdapterPreference() {
  if (!loaded && typeof window !== 'undefined') {
    loaded = true;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored != null && ADAPTER_LABELS.some((adapter) => adapter.id === stored)) {
      selectedAdapter.value = stored as AdapterId;
    }
  }

  function selectAdapter(adapter: AdapterId) {
    selectedAdapter.value = adapter;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, adapter);
    }
  }

  return { selectedAdapter, selectAdapter };
}
