import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useHeadlessCombobox } from '../src';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

describe('useHeadlessCombobox outside setup', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('works without a component instance or a document', () => {
    vi.stubGlobal('document', undefined);

    const selected = ref<User | null>(null);
    const emit = vi.fn();
    const scope = useHeadlessCombobox<User>(
      {
        modelValue: selected,
        options: users,
        optionLabel: (user) => user.name,
      },
      emit,
    );

    scope.isOpen.value = true;
    expect(scope.isOpen.value).toBe(true);

    scope.searchQuery.value = 'wa';
    expect(scope.searchQuery.value).toBe('wa');
    expect(scope.filteredOptions.value).toEqual([ users[ 0 ] ]);

    scope.highlightedIndex.value = 1;
    expect(scope.highlightedIndex.value).toBe(1);

    scope.alignmentOffset.value = 4;
    expect(scope.alignmentOffset.value).toBe(4);
  });

  it('accepts a ref to a props object', () => {
    vi.stubGlobal('document', undefined);

    const scope = useHeadlessCombobox<User>(ref({
      modelValue: users[ 1 ]!,
      options: users,
      optionLabel: (user: User) => user.name,
    }), () => {});

    expect(scope.selectedCount.value).toBe(1);
    expect(scope.isSelected(users[ 1 ]!)).toBe(true);
  });
});
