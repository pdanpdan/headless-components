/**
 * Adapter-specific variants of the Vue examples, generated from the same
 * scenario flags. The playground preview always runs the Vue component; these
 * strings feed the per-adapter code tabs.
 */

export type AdapterId = 'vue' | 'react' | 'svelte' | 'solid' | 'angular';

export const ADAPTER_LABELS: Array<{ id: AdapterId; label: string; }> = [
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'solid', label: 'Solid' },
  { id: 'angular', label: 'Angular' },
];

export interface ExampleMeta {
  object?: boolean;
  multiple?: boolean;
  typeahead?: boolean;
  chips?: boolean;
  filterInput?: boolean;
  validation?: boolean;
  optionValue?: boolean;
  selectOnTab?: boolean;
  alignSelected?: boolean;
  programmatic?: boolean;
  composable?: boolean;
  customFilter?: boolean;
}

export const EXAMPLE_META: Record<string, ExampleMeta> = {
  ComposableProgrammatic: { object: true, programmatic: true, composable: true },
  ComposableSingle: { typeahead: true, composable: true },
  NiceSelect: { object: true, alignSelected: true },
  ObjectMultipleValidated: { object: true, multiple: true, validation: true },
  ObjectSingle: { object: true },
  ObjectValueSingle: { object: true, optionValue: true },
  TextInternal: { filterInput: true },
  TextMultiple: { multiple: true },
  TextMultipleChips: { multiple: true, chips: true },
  TextMultipleCustom: { multiple: true, customFilter: true },
  TextSelectOnTab: { selectOnTab: true },
  TextSingle: {},
  TextTypeahead: { typeahead: true },
  TextTypeaheadChips: { typeahead: true, chips: true },
};

const LANGUAGES = `const languages = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Java',
];`;

const USERS = `interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
];`;

function dataFor(meta: ExampleMeta): string {
  return meta.object
    ? USERS
    : LANGUAGES;
}

function modelType(meta: ExampleMeta, multiple: boolean): string {
  const base = meta.object
    ? 'User'
    : 'string';
  return multiple
    ? `${ base }[]`
    : `${ base } | null`;
}

function extraProps(meta: ExampleMeta): string {
  const props: string[] = [];
  if (meta.multiple) {
    props.push('multiple');
  }
  if (meta.validation) {
    props.push('required', 'minLength={1}', 'maxLength={3}');
  }
  if (meta.selectOnTab) {
    props.push('selectOnTab');
  }
  if (meta.alignSelected) {
    props.push('alignSelected');
  }
  return props.length > 0
    ? ` ${ props.join(' ') }`
    : '';
}

function reactExample(meta: ExampleMeta): string {
  const multiple = meta.multiple === true;
  const model = modelType(meta, multiple);
  const initial = multiple
    ? '[]'
    : 'null';
  const labelProp = meta.object
    ? 'optionLabel={(user) => user.name}'
    : '';
  const valueProp = meta.optionValue
    ? 'optionValue={(user) => user.id}'
    : '';
  const filterProp = meta.customFilter
    ? 'optionFilter={(option, query) => option.toLowerCase().startsWith(query.toLowerCase())}'
    : '';
  const trigger = meta.typeahead
    ? `<input
            ref={(el) => {
              scope.setTriggerRef(el);
              scope.setInputRef(el);
            }}
            {...toReactProps(scope.comboboxInputProps)}
            placeholder="Search…"
          />`
    : `<button ref={scope.setTriggerRef} type="button" {...toReactProps(scope.triggerProps)}>
            Select…
          </button>`;
  const filterInput = meta.filterInput
    ? `<input
            ref={scope.setInputRef}
            {...toReactProps(scope.inputProps)}
            placeholder="Filter…"
          />`
    : '';
  const chips = meta.chips
    ? `<div>
            {scope.selectedList.map((item) => <span key={String(item)}>{String(item)}</span>)}
          </div>`
    : '';
  const programmatic = meta.programmatic
    ? `<div>
            <button type="button" onClick={() => scope.open()}>Open</button>
            <button type="button" onClick={() => scope.select(users[1]!)}>Select Arlene</button>
            <button type="button" onClick={() => scope.clear()}>Clear</button>
          </div>`
    : '';
  const validation = meta.validation
    ? `<p>{scope.validationMessage}</p>`
    : '';
  const optionKey = meta.object
    ? 'user.id'
    : 'language';
  const optionText = meta.object
    ? 'user.name'
    : 'language';
  const listItem = meta.object
    ? `scope.filteredOptions.map((user, index) => (
            <li
              key={${ optionKey }}
              ref={(el) => scope.setOptionRef(user, el)}
              {...toReactProps(scope.getOptionProps(user, index))}
            >
              ${ optionText }
            </li>
          ))`
    : `scope.filteredOptions.map((language, index) => (
            <li
              key={${ optionKey }}
              {...toReactProps(scope.getOptionProps(language, index))}
            >
              ${ optionText }
            </li>
          ))`;
  return `import { useState } from 'react';
import { HeadlessCombobox, toReactProps } from '@pdanpdan/headless-combobox-react';

${ dataFor(meta) }

export function Example() {
  const [value, setValue] = useState<${ model }>(${ initial });

  return (
    <HeadlessCombobox
      options={${ meta.object
        ? 'users'
        : 'languages' }}
      ${ labelProp }
      ${ valueProp }
      ${ filterProp }
      value={value}
      onChange={(next) => setValue(next as ${ model })}
      ${ extraProps(meta) }
    >
      {(scope) => (
        <div ref={scope.setContainerRef}>
          ${ chips }
          ${ trigger }
          ${ filterInput }
          ${ programmatic }
          <ul ref={scope.setDropdownRef} {...toReactProps(scope.listboxProps)}>
            ${ listItem }
          </ul>
          ${ validation }
        </div>
      )}
    </HeadlessCombobox>
  );
}
// The hook form is also available: useHeadlessCombobox({ ... })
// returns the same scope; render it without the component wrapper.
`;
}

function svelteExample(meta: ExampleMeta): string {
  const multiple = meta.multiple === true;
  const initial = multiple
    ? '[]'
    : 'null';
  const labelProp = meta.object
    ? 'optionLabel={(user) => user.name}'
    : '';
  const chips = meta.chips
    ? `{#each scope.selectedList as item}
      <span>{String(item)}</span>
    {/each}`
    : '';
  const trigger = meta.typeahead
    ? `<input
      {...toSvelteProps(scope.comboboxInputProps)}
      {@attach (el) => {
        scope.setTriggerRef(el);
        scope.setInputRef(el);
        return () => {
          scope.setTriggerRef(null);
          scope.setInputRef(null);
        };
      }}
      placeholder="Search…"
    />`
    : `<button
      type="button"
      {...toSvelteProps(scope.triggerProps)}
      {@attach (el) => {
        scope.setTriggerRef(el);
        return () => scope.setTriggerRef(null);
      }}
    >
      Select…
    </button>`;
  const filterInput = meta.filterInput
    ? `<input
      {...toSvelteProps(scope.inputProps)}
      {@attach (el) => {
        scope.setInputRef(el);
        return () => scope.setInputRef(null);
      }}
      placeholder="Filter…"
    />`
    : '';

  return `<script lang="ts">
  import Combobox from '@pdanpdan/headless-combobox-svelte/HeadlessCombobox.svelte';
  import { toSvelteProps } from '@pdanpdan/headless-combobox-svelte';

${ dataFor(meta) }

  let value = $state<${ modelType(meta, multiple) }>(${ initial });
</script>

<Combobox
  options={${ meta.object
    ? 'users'
    : 'languages' }}
  ${ labelProp }
  modelValue={value}
  onChange={(next) => (value = next as ${ modelType(meta, multiple) })}
  ${ multiple
    ? 'multiple'
    : '' }
>
  {#snippet children(scope)}
    <div
      {@attach (el) => {
        scope.setContainerRef(el);
        return () => scope.setContainerRef(null);
      }}
    >
      ${ chips }
      ${ trigger }
      ${ filterInput }

      <ul
        {...toSvelteProps(scope.listboxProps)}
        {@attach (el) => {
          scope.setDropdownRef(el);
          return () => scope.setDropdownRef(null);
        }}
      >
        {#each scope.filteredOptions as option, index}
          <li
            {...toSvelteProps(scope.getOptionProps(option, index))}
            {@attach (el) => {
              scope.setOptionRef(option, el);
              return () => scope.setOptionRef(option, null);
            }}
          >
            {String(option)}
          </li>
        {/each}
      </ul>
    </div>
  {/snippet}
</Combobox>
`;
}

function solidExample(meta: ExampleMeta): string {
  const multiple = meta.multiple === true;
  const labelProp = meta.object
    ? 'optionLabel={(user) => user.name}'
    : '';
  const trigger = meta.typeahead
    ? `<input
          ref={(el) => {
            scope().setTriggerRef(el);
            scope().setInputRef(el);
          }}
          {...toSolidProps(scope().comboboxInputProps)}
          placeholder="Search…"
        />`
    : `<button ref={scope().setTriggerRef} type="button" {...toSolidProps(scope().triggerProps)}>
          Select…
        </button>`;
  const filterInput = meta.filterInput
    ? `<input ref={scope().setInputRef} {...toSolidProps(scope().inputProps)} placeholder="Filter…" />`
    : '';
  const chips = meta.chips
    ? `<For each={scope().selectedList}>{(item) => <span>{String(item)}</span>}</For>`
    : '';

  return `import { For, createSignal } from 'solid-js';
import { HeadlessCombobox, toSolidProps } from '@pdanpdan/headless-combobox-solid';

${ dataFor(meta) }

export function Example() {
  const [value, setValue] = createSignal<${ modelType(meta, multiple) }>(${ multiple
    ? '[]'
    : 'null' });

  return (
    <HeadlessCombobox
      options={${ meta.object
        ? 'users'
        : 'languages' }}
      ${ labelProp }
      value={value()}
      onChange={(next) => setValue(next as ${ modelType(meta, multiple) })}
      ${ multiple
        ? 'multiple'
        : '' }
    >
      {(scope) => (
        <div ref={scope().setContainerRef}>
          ${ chips }
          ${ trigger }
          ${ filterInput }
          <ul ref={scope().setDropdownRef} {...toSolidProps(scope().listboxProps)}>
            <For each={scope().filteredOptions}>
              {(option, index) => (
                <li {...toSolidProps(scope().getOptionProps(option, index()))}>
                  {String(option)}
                </li>
              )}
            </For>
          </ul>
        </div>
      )}
    </HeadlessCombobox>
  );
}
`;
}

function angularExample(meta: ExampleMeta): string {
  const multiple = meta.multiple === true;
  const label = meta.object
    ? 'optionLabel: (user) => user.name,'
    : '';
  const chips = meta.chips
    ? `<span *ngFor="let item of combobox.snapshot().selectedList">{{ item }}</span>`
    : '';

  return `import { Component, signal } from '@angular/core';
import { injectCombobox } from '@pdanpdan/headless-combobox-angular';

${ dataFor(meta) }

@Component({
  standalone: true,
  selector: 'app-example',
  template: \`
    <div>
      ${ chips }
      <button
        type="button"
        [attr.aria-expanded]="combobox.snapshot().triggerProps['aria-expanded']"
        (click)="combobox.snapshot().triggerProps.onClick()"
      >
        Select…
      </button>

      <ul [attr.role]="combobox.snapshot().listboxProps.role">
        @for (option of combobox.snapshot().filteredOptions; track option) {
          <li
            [attr.role]="'option'"
            [attr.aria-selected]="combobox.snapshot().isSelected(option)"
            (click)="combobox.snapshot().select(option)"
          >
            {{ option }}
          </li>
        }
      </ul>
    </div>
  \`,
})
export class ExampleComponent {
  readonly value = signal<${ modelType(meta, multiple) }>(${ multiple
    ? '[]'
    : 'null' });

  readonly combobox = injectCombobox({
    props: () => ({
      modelValue: this.value(),
      options: ${ meta.object
        ? 'users'
        : 'languages' },
      ${ label }
      ${ multiple
        ? 'multiple: true,'
        : '' }
    }),
    onChange: (next) => this.value.set(next as ${ modelType(meta, multiple) }),
  });
}
`;
}

export function adapterSources(name: string): Record<Exclude<AdapterId, 'vue'>, string> {
  const meta = EXAMPLE_META[ name ] ?? {};
  return {
    react: reactExample(meta),
    svelte: svelteExample(meta),
    solid: solidExample(meta),
    angular: angularExample(meta),
  };
}
