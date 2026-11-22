import type { Injector } from '@angular/core';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createComboboxStore } from '../src';

vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@angular/core')>();
  return {
    ...actual,
    afterNextRender: (callback: () => void) => {
      callback();
      return {
        destroy: () => {},
      };
    },
  };
});

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

describe('angular next tick', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves the tick through afterNextRender', async () => {
    const injector = {} as unknown as Injector;
    const combobox = createComboboxStore<User, User>({
      props: {
        modelValue: null,
        options: users,
        optionLabel: (user) => user.name,
      },
      injector,
    });

    await combobox.store.getSnapshot().open();
    expect(combobox.snapshot().isOpen).toBe(true);

    combobox.destroy();
  });

  it('skips mounting without a document', () => {
    vi.stubGlobal('document', undefined);
    const combobox = createComboboxStore<User, User>({
      props: {
        modelValue: null,
        options: users,
        optionLabel: (user) => user.name,
      },
    });

    expect(combobox.snapshot().isOpen).toBe(false);
    combobox.destroy();
  });
});
