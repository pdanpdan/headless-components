import { afterEach, describe, expect, it } from 'vitest';

import { createCombobox } from '../src';
import { scrollElementIntoContainer } from '../src/positioning';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

function makeStore(overrides: Record<string, unknown> = {}) {
  return createCombobox<User, User>({
    props: {
      modelValue: null,
      options: users,
      optionLabel: (user: User) => user.name,
      ...overrides,
    } as never,
    onChange: () => {},
  });
}

function rect(top: number, bottom: number, width = 100, height = bottom - top) {
  return { top, bottom, width, height } as DOMRect;
}

describe('core positioning', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ignores a missing scroll container', () => {
    const element = document.createElement('div');
    scrollElementIntoContainer(element, null);
  });

  it('scrolls an element above and below the container', () => {
    const container = document.createElement('div');
    const above = document.createElement('div');
    const below = document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => rect(100, 200),
    });
    Object.defineProperty(container, 'offsetWidth', { value: 100 });
    Object.defineProperty(above, 'getBoundingClientRect', {
      value: () => rect(50, 80),
    });
    Object.defineProperty(below, 'getBoundingClientRect', {
      value: () => rect(250, 280),
    });

    container.scrollTop = 100;
    scrollElementIntoContainer(above, container);
    expect(container.scrollTop).toBe(50);

    container.scrollTop = 100;
    scrollElementIntoContainer(below, container);
    expect(container.scrollTop).toBe(180);
  });

  it('treats an unscaled container as scale 1', () => {
    const container = document.createElement('div');
    const below = document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => rect(0, 100, 0),
    });
    Object.defineProperty(container, 'offsetWidth', { value: 0 });
    Object.defineProperty(below, 'getBoundingClientRect', {
      value: () => rect(200, 300, 0),
    });

    container.scrollTop = 0;
    scrollElementIntoContainer(below, container);
    expect(container.scrollTop).toBe(200);
  });

  it('divides out a CSS scale', () => {
    const container = document.createElement('div');
    const below = document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => rect(0, 100, 200),
    });
    Object.defineProperty(container, 'offsetWidth', { value: 100 });
    Object.defineProperty(below, 'getBoundingClientRect', {
      value: () => rect(200, 300, 200),
    });

    container.scrollTop = 0;
    scrollElementIntoContainer(below, container);
    expect(container.scrollTop).toBe(100);
  });

  it('resets alignment without the required pieces', async () => {
    const plain = makeStore();
    await plain.getSnapshot().open();
    expect(plain.getSnapshot().alignmentOffset).toBe(0);

    const noSelected = makeStore({ alignSelected: true });
    await noSelected.getSnapshot().open();
    expect(noSelected.getSnapshot().alignmentOffset).toBe(0);

    const noDropdown = makeStore({ alignSelected: true, modelValue: users[ 0 ]! });
    await noDropdown.getSnapshot().open();
    expect(noDropdown.getSnapshot().alignmentOffset).toBe(0);
  });

  it('aligns the selected option over the trigger', async () => {
    const store = makeStore({ alignSelected: true, modelValue: users[ 1 ]! });
    const dropdown = document.createElement('div');
    const list = document.createElement('div');
    const option = document.createElement('div');
    document.body.append(dropdown);
    dropdown.append(list);
    list.append(option);

    Object.defineProperty(dropdown, 'getBoundingClientRect', {
      value: () => rect(100, 200, 200),
    });
    Object.defineProperty(dropdown, 'offsetWidth', { value: 100 });
    Object.defineProperty(option, 'getBoundingClientRect', {
      value: () => rect(180, 220, 200),
    });
    Object.defineProperty(list, 'getBoundingClientRect', {
      value: () => rect(100, 200, 200),
    });
    Object.defineProperty(list, 'offsetWidth', { value: 100 });

    store.getSnapshot().setDropdownRef(dropdown);
    store.getSnapshot().setListRef(list);
    store.getSnapshot().setOptionRef(users[ 1 ]!, option);

    await store.getSnapshot().open();
    expect(store.getSnapshot().alignmentOffset).toBe(40);
  });

  it('handles a missing or unscaled selected option', async () => {
    const missing = makeStore({
      alignSelected: true,
      modelValue: 999,
      optionValue: (user: User) => user.id,
    });
    const dropdown = document.createElement('div');
    const list = document.createElement('div');
    Object.defineProperty(dropdown, 'getBoundingClientRect', {
      value: () => rect(0, 100),
    });
    Object.defineProperty(dropdown, 'offsetWidth', { value: 0 });
    Object.defineProperty(list, 'getBoundingClientRect', {
      value: () => rect(0, 100),
    });
    missing.getSnapshot().setDropdownRef(dropdown);
    missing.getSnapshot().setListRef(list);

    await missing.getSnapshot().open();
    expect(missing.getSnapshot().alignmentOffset).toBe(0);

    const zeroScale = makeStore({ alignSelected: true, modelValue: users[ 0 ]! });
    const zeroDropdown = document.createElement('div');
    const zeroList = document.createElement('div');
    const zeroOption = document.createElement('div');
    Object.defineProperty(zeroDropdown, 'getBoundingClientRect', {
      value: () => rect(0, 100, 0),
    });
    Object.defineProperty(zeroDropdown, 'offsetWidth', { value: 100 });
    Object.defineProperty(zeroOption, 'getBoundingClientRect', {
      value: () => rect(50, 70, 0),
    });
    Object.defineProperty(zeroList, 'getBoundingClientRect', {
      value: () => rect(0, 100, 0),
    });
    Object.defineProperty(zeroList, 'offsetWidth', { value: 100 });
    zeroScale.getSnapshot().setDropdownRef(zeroDropdown);
    zeroScale.getSnapshot().setListRef(zeroList);
    zeroScale.getSnapshot().setOptionRef(users[ 0 ]!, zeroOption);

    await zeroScale.getSnapshot().open();
    expect(zeroScale.getSnapshot().alignmentOffset).toBe(50);

    const noOffset = makeStore({ alignSelected: true, modelValue: users[ 0 ]! });
    const noOffsetDropdown = document.createElement('div');
    const noOffsetList = document.createElement('div');
    const noOffsetOption = document.createElement('div');
    Object.defineProperty(noOffsetDropdown, 'getBoundingClientRect', {
      value: () => rect(0, 100),
    });
    Object.defineProperty(noOffsetDropdown, 'offsetWidth', { value: 0 });
    Object.defineProperty(noOffsetOption, 'getBoundingClientRect', {
      value: () => rect(50, 70),
    });
    Object.defineProperty(noOffsetList, 'getBoundingClientRect', {
      value: () => rect(0, 100),
    });
    noOffset.getSnapshot().setDropdownRef(noOffsetDropdown);
    noOffset.getSnapshot().setListRef(noOffsetList);
    noOffset.getSnapshot().setOptionRef(users[ 0 ]!, noOffsetOption);

    await noOffset.getSnapshot().open();
    expect(noOffset.getSnapshot().alignmentOffset).toBe(50);
  });

  it('resets alignment when the selected element or list is missing', async () => {
    const store = makeStore({ alignSelected: true, modelValue: users[ 0 ]! });
    const dropdown = document.createElement('div');
    Object.defineProperty(dropdown, 'getBoundingClientRect', {
      value: () => rect(0, 100),
    });
    Object.defineProperty(dropdown, 'offsetWidth', { value: 100 });
    store.getSnapshot().setDropdownRef(dropdown);

    await store.getSnapshot().open();
    expect(store.getSnapshot().alignmentOffset).toBe(0);
  });

  it('scrolls the highlighted option into view', async () => {
    const store = makeStore();
    const list = document.createElement('div');
    const option = document.createElement('div');
    Object.defineProperty(list, 'getBoundingClientRect', {
      value: () => rect(0, 100),
    });
    Object.defineProperty(list, 'clientHeight', { value: 100 });
    Object.defineProperty(option, 'getBoundingClientRect', {
      value: () => rect(120, 140),
    });
    Object.defineProperty(option, 'offsetHeight', { value: 20 });

    store.getSnapshot().setListRef(list);
    store.getSnapshot().setOptionRef(users[ 0 ]!, option);

    await store.getSnapshot().open();
    expect(list.scrollTop).toBe(40);

    store.getSnapshot().setListRef(null);
    await store.getSnapshot().open();
  });
});
