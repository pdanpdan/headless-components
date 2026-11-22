/**
 * Adapter-specific variants of the Vue examples. The playground preview always
 * runs the Vue component; these strings feed the per-adapter code tabs.
 *
 * Every adapter example mirrors the same Vue example: same state, props,
 * selected label, filtering, chips, validation, and programmatic controls.
 * Styling is intentionally minimal so the behavior stays visible.
 */

export type AdapterId = 'vue' | 'react' | 'svelte' | 'solid' | 'angular';

export interface ExampleMeta {
  object?: boolean;
  multiple?: boolean;
  typeahead?: boolean;
  filterInput?: boolean;
  chips?: 'trigger' | 'removable' | 'field';
  validation?: boolean;
  optionValue?: boolean;
  selectOnTab?: boolean;
  alignSelected?: boolean;
  programmatic?: boolean;
  composable?: boolean;
  customOptions?: boolean;
  internal?: boolean;
  grouped?: boolean;
  maxLength?: number;
  status?: boolean;
}

export const EXAMPLE_META: Record<string, ExampleMeta> = {
  ComposableProgrammatic: { object: true, programmatic: true, composable: true },
  ComposableSingle: { typeahead: true, composable: true },
  GroupedOptions: { grouped: true, filterInput: true },
  NiceSelect: { object: true, alignSelected: true },
  ObjectMultipleValidated: {
    object: true,
    multiple: true,
    filterInput: true,
    validation: true,
  },
  ObjectSingle: { object: true, filterInput: true },
  ObjectValueSingle: { object: true, optionValue: true },
  TextInternal: { internal: true },
  TextMultiple: {
    multiple: true,
    filterInput: true,
    chips: 'trigger',
    maxLength: 3,
  },
  TextMultipleChips: {
    multiple: true,
    filterInput: true,
    chips: 'removable',
    maxLength: 3,
  },
  TextMultipleCustom: {
    multiple: true,
    filterInput: true,
    chips: 'trigger',
    customOptions: true,
    maxLength: 3,
  },
  TextSelectOnTab: { selectOnTab: true },
  TextSingle: {},
  TextTypeahead: { typeahead: true, status: true },
  TextTypeaheadChips: {
    typeahead: true,
    multiple: true,
    chips: 'field',
    maxLength: 3,
  },
};

const FRAMEWORKS = `const frameworks = [
  'Vue',
  'React',
  'Svelte',
  'Solid',
  'Angular',
];`;

const LANGUAGES = `const languages = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
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

const GROUPED = `const groups: Record<string, string[]> = {
  Frontend: ['Vue', 'React', 'Svelte', 'Solid', 'Angular'],
  Backend: ['Node.js', 'Deno', 'Bun', 'Go', 'Rust'],
  Database: ['PostgreSQL', 'SQLite', 'MySQL', 'MongoDB'],
};

const options = Object.values(groups).flat();

// Group order mirrors the flat options order, which is what keyboard
// navigation and aria-activedescendant follow.
function groupedOptions(visible: string[]) {
  return Object.entries(groups)
    .map(([ label, items ]) => ({
      label,
      items: items.filter((item) => visible.includes(item)),
    }))
    .filter((group) => group.items.length > 0);
}`;

function dataFor(meta: ExampleMeta): string {
  if (meta.object) {
    return USERS;
  }
  if (meta.grouped) {
    return GROUPED;
  }
  return meta.typeahead
    ? LANGUAGES
    : FRAMEWORKS;
}

function optionsFor(meta: ExampleMeta): string {
  if (meta.object) {
    return 'users';
  }
  if (meta.grouped) {
    return 'options';
  }
  return meta.typeahead
    ? 'languages'
    : 'frameworks';
}

function modelType(meta: ExampleMeta): string {
  const base = meta.optionValue
    ? 'number'
    : meta.object
      ? 'User'
      : 'string';
  return meta.multiple
    ? `${ base }[]`
    : `${ base } | null`;
}

function initialValue(meta: ExampleMeta): string {
  if (meta.multiple) {
    if (meta.object) {
      return '[ users[0]! ]';
    }
    return meta.typeahead
      ? "[ 'TypeScript' ]"
      : "[ 'Vue', 'Svelte' ]";
  }
  if (meta.object) {
    return meta.optionValue
      ? '1'
      : 'users[0]!';
  }
  if (meta.grouped) {
    return "'Vue'";
  }
  return meta.typeahead
    ? "'TypeScript'"
    : "'Vue'";
}

function maxLength(meta: ExampleMeta): number {
  return meta.maxLength ?? 3;
}

function extraProps(meta: ExampleMeta): string[] {
  const props: string[] = [];
  if (meta.multiple) {
    props.push('multiple');
  }
  if (meta.maxLength) {
    props.push(`maxLength={${ meta.maxLength }}`);
  }
  if (meta.validation) {
    props.push('required', 'minLength={2}', `maxLength={${ maxLength(meta) }}`);
  }
  if (meta.selectOnTab) {
    props.push('selectOnTab');
  }
  if (meta.alignSelected) {
    props.push('alignSelected');
  }
  if (meta.object) {
    props.push('optionLabel={(user) => user.name}');
  }
  if (meta.optionValue) {
    props.push('optionValue={(user) => user.id}');
  }
  if (meta.programmatic) {
    props.push("clickOutsideFilter={(target: EventTarget | null) => !(target instanceof HTMLElement && target.closest('.controls'))}");
  }
  return props;
}

function extraOptions(meta: ExampleMeta): string[] {
  const options: string[] = [];
  if (meta.multiple) {
    options.push('multiple: true,');
  }
  if (meta.maxLength) {
    options.push(`maxLength: ${ meta.maxLength },`);
  }
  if (meta.validation) {
    options.push('required: true,', 'minLength: 2,', `maxLength: ${ maxLength(meta) },`);
  }
  if (meta.selectOnTab) {
    options.push('selectOnTab: true,');
  }
  if (meta.alignSelected) {
    options.push('alignSelected: true,');
  }
  if (meta.object) {
    options.push('optionLabel: (user: User) => user.name,');
  }
  if (meta.optionValue) {
    options.push('optionValue: (user: User) => user.id,');
  }
  if (meta.programmatic) {
    options.push("clickOutsideFilter: (target: EventTarget | null) => !(target instanceof HTMLElement && target.closest('.controls')),");
  }
  return options;
}

function optionKey(meta: ExampleMeta): string {
  return meta.object
    ? 'option.id'
    : 'option';
}

function optionText(meta: ExampleMeta): string {
  return meta.object
    ? 'option.name'
    : 'option';
}

function chipLabel(meta: ExampleMeta): string {
  return meta.object
    ? 'item.name'
    : 'item';
}

function chipKey(meta: ExampleMeta): string {
  return meta.object
    ? 'item.id'
    : 'item';
}

function indented(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => {
      if (!line) {
        return line;
      }
      return `${ pad }${ line }`;
    })
    .join('\n');
}

function braces(expression: string): string {
  return `{${ expression }}`;
}

function interpolation(expression: string): string {
  return `{{ ${ expression } }}`;
}

function hasChips(meta: ExampleMeta): boolean {
  return meta.chips !== undefined;
}

function reactChips(meta: ExampleMeta, removable: boolean): string {
  if (!hasChips(meta) || (!removable && meta.chips !== 'trigger')) {
    return '';
  }
  const remove = removable
    ? ` <button type="button" onClick={() => scope.select(item)}>×</button>`
    : '';
  return `<div>
  {scope.selectedList.map((item) => (
    <span key={${ chipKey(meta) }}>
      ${ braces(chipLabel(meta)) }${ remove }
    </span>
  ))}
</div>`;
}

function reactTriggerContent(meta: ExampleMeta): string {
  if (meta.multiple) {
    if (meta.chips === 'trigger') {
      return `<span>
  {scope.selectedList.map((item) => (
    <span key={${ chipKey(meta) }}>${ braces(chipLabel(meta)) }</span>
  ))}
</span>
<span>{scope.selectedCount}/${ maxLength(meta) }</span>`;
    }
    return `{scope.selectedCount ? String(scope.selectedCount) + ' selected' : 'Select…'}`;
  }
  if (meta.internal) {
    return meta.object
      ? `{scope.selectedList[0]?.name ?? 'Select…'}`
      : `{scope.selectedList[0] ?? 'Select…'}`;
  }
  if (meta.object) {
    return meta.optionValue
      ? `{users.find((user) => user.id === value)?.name ?? 'Select…'}`
      : `{value?.name ?? 'Select…'}`;
  }
  return `{value ?? 'Select…'}`;
}

function reactField(meta: ExampleMeta): string {
  if (meta.typeahead) {
    const valueExpr = meta.multiple
      ? "scope.searchQuery ?? ''"
      : "scope.searchQuery ?? value ?? ''";
    const input = `<input
  ref={(el) => {
    scope.setTriggerRef(el);
    scope.setInputRef(el);
  }}
  {...toReactProps(scope.comboboxInputProps)}
  value={${ valueExpr }}
  placeholder="Search…"
/>`;
    if (meta.chips === 'field') {
      return `<div>
${ indented(reactChips(meta, true), 2) }
${ indented(input, 2) }
</div>`;
    }
    return input;
  }
  const chips = meta.chips === 'removable'
    ? `${ reactChips(meta, true) }\n`
    : '';
  return `${ chips }<button
  ref={scope.setTriggerRef}
  type="button"
  {...toReactProps(scope.triggerProps)}
>
${ indented(reactTriggerContent(meta), 2) }
</button>`;
}

function reactList(meta: ExampleMeta): string {
  const filter = meta.filterInput
    ? `<div>
  <input
    ref={scope.setInputRef}
    {...toReactProps(scope.inputProps)}
    value={scope.searchQuery ?? ''}
    placeholder="Search…"
  />
  <button type="button" onClick={scope.clear}>Clear</button>
</div>
`
    : '';
  if (meta.grouped) {
    return `${ filter }<ul {...toReactProps(scope.listboxProps)}>
  {groupedOptions(scope.filteredOptions).map((group) => (
    <li key={group.label} role="group" aria-label={group.label}>
      <span aria-hidden="true">{group.label}</span>
      {group.items.map((option) => (
        <button
          key={option}
          type="button"
          ref={(el) => scope.setOptionRef(option, el)}
          {...toReactProps(scope.getOptionProps(option))}
        >
          {scope.isSelected(option) ? '✓ ' : ''}
          {option}
        </button>
      ))}
    </li>
  ))}
</ul>`;
  }
  const optionRef = meta.alignSelected
    ? ` ref={(el) => scope.setOptionRef(option, el)}`
    : '';
  const indicator = meta.customOptions
    ? `<span aria-hidden="true">{scope.isSelected(option) ? '✓' : '☐'}</span>{' '}`
    : '';
  return `${ filter }<ul {...toReactProps(scope.listboxProps)}>
  {scope.filteredOptions.map((option, index) => (
    <li
      key={${ optionKey(meta) }}${ optionRef }
      {...toReactProps(scope.getOptionProps(option, index))}
    >
      ${ indicator }${ braces(optionText(meta)) }${ meta.optionValue ? ' <span>{option.id}</span>' : '' }
    </li>
  ))}
</ul>`;
}

function reactBody(meta: ExampleMeta): string {
  const controlBlock = meta.programmatic
    ? `<div className="controls">
  <button type="button" onClick={() => scope.open()}>Open</button>
  <button type="button" onClick={() => scope.close()}>Close</button>
  <button type="button" onClick={() => scope.select(users[1]!)}>Select Arlene</button>
  <button type="button" onClick={() => scope.clear()}>Clear</button>
</div>`
    : '';
  const controls = controlBlock
    ? `${ indented(controlBlock, 2) }\n`
    : '';
  const validation = meta.validation
    ? `  <p>{scope.valid ? 'Looks good.' : scope.validationMessage}</p>\n`
    : '';
  const status = meta.status
    ? `  <p {...scope.statusProps} className="sr-only">{scope.statusMessage}</p>\n`
    : '';
  const container = `<div ref={scope.setContainerRef}>
${ indented(reactField(meta), 2) }
${ status }  {scope.isOpen && (
    <div>
${ indented(reactList(meta), 6) }
    </div>
  )}
</div>`;
  if (!controls && !validation) {
    return container;
  }
  const controlsBlock = controls
    ? `${ indented(controls, 2) }\n`
    : '';
  return `<div>
${ controlsBlock }${ indented(container, 2) }
${ validation }</div>`;
}

export function reactExample(meta: ExampleMeta): string {
  const model = modelType(meta);
  if (meta.composable) {
    return `import { useState } from 'react';
import { toReactProps, useHeadlessCombobox } from '@pdanpdan/headless-combobox-react';

${ dataFor(meta) }

export function Example() {
  const [value, setValue] = useState<${ model }>(${ initialValue(meta) });
  const scope = useHeadlessCombobox({
    options: ${ optionsFor(meta) },
    value,
    onChange: (next) => setValue(next as ${ model }),
    ${ extraOptions(meta).join('\n    ') }
  });

  return (
${ indented(reactBody(meta), 4) }
  );
}
`;
  }

  const valueProps = meta.internal
    ? `
      defaultValue="Vue"`
    : `
      value={value}
      onChange={(next) => setValue(next as ${ model })}`;
  const valueState = meta.internal
    ? ''
    : `  const [value, setValue] = useState<${ model }>(${ initialValue(meta) });\n`;
  const props = [
    `options={${ optionsFor(meta) }}`,
    ...extraProps(meta),
  ]
    .map((prop) => `      ${ prop }`)
    .join('\n');
  return `import { useState } from 'react';
import { HeadlessCombobox, toReactProps } from '@pdanpdan/headless-combobox-react';

${ dataFor(meta) }

export function Example() {
${ valueState }
  return (
    <HeadlessCombobox
${ props }${ valueProps }
    >
      {(scope) => (
${ indented(reactBody(meta), 8) }
      )}
    </HeadlessCombobox>
  );
}
`;
}

function svelteChips(meta: ExampleMeta, removable: boolean): string {
  if (!hasChips(meta) || (!removable && meta.chips !== 'trigger')) {
    return '';
  }
  const remove = removable
    ? ` <button type="button" onclick={() => scope.select(item)}>×</button>`
    : '';
  return `<div>
  {#each scope.selectedList as item (${ chipKey(meta) })}
    <span>${ braces(chipLabel(meta)) }${ remove }</span>
  {/each}
</div>`;
}

function svelteTriggerContent(meta: ExampleMeta): string {
  if (meta.multiple) {
    if (meta.chips === 'trigger') {
      return `{#each scope.selectedList as item (${ chipKey(meta) })}
  <span>${ braces(chipLabel(meta)) }</span>
{/each}
<span>{scope.selectedCount}/${ maxLength(meta) }</span>`;
    }
    return `{scope.selectedCount ? String(scope.selectedCount) + ' selected' : 'Select…'}`;
  }
  if (meta.internal) {
    return meta.object
      ? `{scope.selectedList[0]?.name ?? 'Select…'}`
      : `{scope.selectedList[0] ?? 'Select…'}`;
  }
  if (meta.object) {
    return meta.optionValue
      ? `{users.find((user) => user.id === value)?.name ?? 'Select…'}`
      : `{value?.name ?? 'Select…'}`;
  }
  return `{value ?? 'Select…'}`;
}

function svelteField(meta: ExampleMeta): string {
  if (meta.typeahead) {
    const valueExpr = meta.multiple
      ? "scope.searchQuery ?? ''"
      : "scope.searchQuery ?? value ?? ''";
    const input = `<input
  {...toSvelteProps(scope.comboboxInputProps)}
  {@attach (el) => {
    scope.setTriggerRef(el);
    scope.setInputRef(el);
  }}
  value={${ valueExpr }}
  placeholder="Search…"
/>`;
    if (meta.chips === 'field') {
      return `<div>
${ indented(svelteChips(meta, true), 2) }
${ indented(input, 2) }
</div>`;
    }
    return input;
  }
  const chips = meta.chips === 'removable'
    ? `${ svelteChips(meta, true) }\n`
    : '';
  return `${ chips }<button
  type="button"
  {...toSvelteProps(scope.triggerProps)}
  {@attach scope.setTriggerRef}
>
${ indented(svelteTriggerContent(meta), 2) }
</button>`;
}

function svelteList(meta: ExampleMeta): string {
  const filter = meta.filterInput
    ? `<div>
  <input
    {...toSvelteProps(scope.inputProps)}
    {@attach scope.setInputRef}
    value={scope.searchQuery ?? ''}
    placeholder="Search…"
  />
  <button type="button" onclick={scope.clear}>Clear</button>
</div>
`
    : '';
  if (meta.grouped) {
    return `${ filter }<ul {...toSvelteProps(scope.listboxProps)}>
  {#each groupedOptions(scope.filteredOptions) as group (group.label)}
    <li role="group" aria-label={group.label}>
      <span aria-hidden="true">{group.label}</span>
      {#each group.items as option (option)}
        <button
          type="button"
          {...toSvelteProps(scope.getOptionProps(option))}
          {@attach (el) => scope.setOptionRef(option, el)}
        >
          {scope.isSelected(option) ? '✓ ' : ''}{option}
        </button>
      {/each}
    </li>
  {/each}
</ul>`;
  }
  const optionRef = meta.alignSelected
    ? ` {@attach (el) => scope.setOptionRef(option, el)}`
    : '';
  const indicator = meta.customOptions
    ? `<span aria-hidden="true">{scope.isSelected(option) ? '✓' : '☐'}</span>{' '}`
    : '';
  return `${ filter }<ul {...toSvelteProps(scope.listboxProps)}>
  {#each scope.filteredOptions as option, index (${ optionKey(meta) })}
    <li${ optionRef } {...toSvelteProps(scope.getOptionProps(option, index))}>
      ${ indicator }${ braces(optionText(meta)) }${ meta.optionValue ? ' <span>{option.id}</span>' : '' }
    </li>
  {/each}
</ul>`;
}

function svelteBody(meta: ExampleMeta): string {
  const controls = meta.programmatic
    ? `<div class="controls">
  <button type="button" onclick={() => scope.open()}>Open</button>
  <button type="button" onclick={() => scope.close()}>Close</button>
  <button type="button" onclick={() => scope.select(users[1]!)}>Select Arlene</button>
  <button type="button" onclick={() => scope.clear()}>Clear</button>
</div>
`
    : '';
  const validation = meta.validation
    ? `  <p>{scope.valid ? 'Looks good.' : scope.validationMessage}</p>\n`
    : '';
  const status = meta.status
    ? `  <p {...scope.statusProps} class="sr-only">{scope.statusMessage}</p>\n`
    : '';
  return `${ controls }<div {@attach scope.setContainerRef}>
${ indented(svelteField(meta), 2) }
${ status }  {#if scope.isOpen}
    <div>
${ indented(svelteList(meta), 6) }
    </div>
  {/if}
</div>
${ validation }`;
}

export function svelteExample(meta: ExampleMeta): string {
  const model = modelType(meta);
  if (meta.composable) {
    return `<script lang="ts">
  import { onMount } from 'svelte';
  import { createComboboxStore, toSvelteProps } from '@pdanpdan/headless-combobox-svelte';

${ dataFor(meta) }

  let value = $state<${ model }>(${ initialValue(meta) });
  const combobox = createComboboxStore({
    props: () => ({
      modelValue: value,
      options: ${ optionsFor(meta) },
      ${ extraOptions(meta).join('\n      ') }
    }),
    onChange: (next) => (value = next as ${ model }),
  });

  onMount(() => {
    combobox.mount();
    return () => combobox.destroy();
  });
</script>

${ svelteBodyForStore(meta).trimEnd() }
`;
  }

  const valueProps = meta.internal
    ? '  modelValue="Vue"\n'
    : `  modelValue={value}\n  onChange={(next) => (value = next as ${ model })}\n`;
  const valueState = meta.internal
    ? ''
    : `  let value = $state<${ model }>(${ initialValue(meta) });\n`;
  const props = [
    `options={${ optionsFor(meta) }}`,
    ...extraProps(meta),
  ]
    .map((prop) => `  ${ prop }`)
    .join('\n');
  return `<script lang="ts">
  import HeadlessCombobox from '@pdanpdan/headless-combobox-svelte/HeadlessCombobox.svelte';
  import { toSvelteProps } from '@pdanpdan/headless-combobox-svelte';

${ dataFor(meta) }

${ valueState }</script>

<HeadlessCombobox
${ props }
${ valueProps }>
  {#snippet children(scope)}
${ indented(svelteBody(meta).trimEnd(), 4) }
  {/snippet}
</HeadlessCombobox>
`;
}

function svelteBodyForStore(meta: ExampleMeta): string {
  const body = svelteBody(meta).replaceAll('scope.', '$combobox.');
  return body;
}

function solidChips(meta: ExampleMeta, removable: boolean): string {
  if (!hasChips(meta) || (!removable && meta.chips !== 'trigger')) {
    return '';
  }
  const remove = removable
    ? ` <button type="button" onClick={() => scope().select(item)}>×</button>`
    : '';
  return `<div>
  <For each={scope().selectedList}>
    {(item) => (
      <span>
        ${ braces(meta.object ? 'item.name' : 'item') }${ remove }
      </span>
    )}
  </For>
</div>`;
}

function solidTriggerContent(meta: ExampleMeta): string {
  if (meta.multiple) {
    if (meta.chips === 'trigger') {
      return `<For each={scope().selectedList}>
  {(item) => <span>${ braces(meta.object ? 'item.name' : 'item') }</span>}
</For>
<span>{scope().selectedCount}/${ maxLength(meta) }</span>`;
    }
    return `{scope().selectedCount ? String(scope().selectedCount) + ' selected' : 'Select…'}`;
  }
  if (meta.internal) {
    return meta.object
      ? `{scope().selectedList[0]?.name ?? 'Select…'}`
      : `{scope().selectedList[0] ?? 'Select…'}`;
  }
  if (meta.object) {
    return meta.optionValue
      ? `{users.find((user) => user.id === value())?.name ?? 'Select…'}`
      : `{value()?.name ?? 'Select…'}`;
  }
  return `{value() ?? 'Select…'}`;
}

function solidField(meta: ExampleMeta): string {
  if (meta.typeahead) {
    const valueExpr = meta.multiple
      ? "scope().searchQuery ?? ''"
      : "scope().searchQuery ?? value() ?? ''";
    const input = `<input
  ref={(el) => {
    scope().setTriggerRef(el);
    scope().setInputRef(el);
  }}
  {...toSolidProps(scope().comboboxInputProps)}
  value={${ valueExpr }}
  placeholder="Search…"
/>`;
    if (meta.chips === 'field') {
      return `<div>
${ indented(solidChips(meta, true), 2) }
${ indented(input, 2) }
</div>`;
    }
    return input;
  }
  const chips = meta.chips === 'removable'
    ? `${ solidChips(meta, true) }\n`
    : '';
  return `${ chips }<button
  ref={scope().setTriggerRef}
  type="button"
  {...toSolidProps(scope().triggerProps)}
>
${ indented(solidTriggerContent(meta), 2) }
</button>`;
}

function solidList(meta: ExampleMeta): string {
  const filter = meta.filterInput
    ? `<div>
  <input
    ref={scope().setInputRef}
    {...toSolidProps(scope().inputProps)}
    value={scope().searchQuery ?? ''}
    placeholder="Search…"
  />
  <button type="button" onClick={scope().clear}>Clear</button>
</div>
`
    : '';
  if (meta.grouped) {
    return `${ filter }<ul {...toSolidProps(scope().listboxProps)}>
  <For each={groupedOptions(scope().filteredOptions)}>
    {(group) => (
      <li role="group" aria-label={group.label}>
        <span aria-hidden="true">{group.label}</span>
        <For each={group.items}>
          {(option) => (
            <button
              type="button"
              ref={(el) => scope().setOptionRef(option, el)}
              {...toSolidProps(scope().getOptionProps(option))}
            >
              {scope().isSelected(option) ? '✓ ' : ''}{option}
            </button>
          )}
        </For>
      </li>
    )}
  </For>
</ul>`;
  }
  const optionRef = meta.alignSelected
    ? ` ref={(el) => scope().setOptionRef(option, el)}`
    : '';
  const indicator = meta.customOptions
    ? `<span aria-hidden="true">{scope().isSelected(option) ? '✓' : '☐'}</span>{' '}`
    : '';
  return `${ filter }<ul {...toSolidProps(scope().listboxProps)}>
  <For each={scope().filteredOptions}>
    {(option, index) => (
      <li${ optionRef } {...toSolidProps(scope().getOptionProps(option, index()))}>
        ${ indicator }${ braces(optionText(meta)) }${ meta.optionValue ? ' <span>{option.id}</span>' : '' }
      </li>
    )}
  </For>
</ul>`;
}

function solidBody(meta: ExampleMeta): string {
  const controls = meta.programmatic
    ? `<div class="controls">
  <button type="button" onClick={() => scope().open()}>Open</button>
  <button type="button" onClick={() => scope().close()}>Close</button>
  <button type="button" onClick={() => scope().select(users[1]!)}>Select Arlene</button>
  <button type="button" onClick={() => scope().clear()}>Clear</button>
</div>
`
    : '';
  const validation = meta.validation
    ? `  <p>{scope().valid ? 'Looks good.' : scope().validationMessage}</p>\n`
    : '';
  const status = meta.status
    ? `  <p {...scope().statusProps} class="sr-only">{scope().statusMessage}</p>\n`
    : '';
  const container = `<div ref={scope().setContainerRef}>
${ indented(solidField(meta), 2) }
${ status }  {scope().isOpen && (
    <div>
${ indented(solidList(meta), 6) }
    </div>
  )}
</div>`;
  if (!controls && !validation) {
    return container;
  }
  const controlsBlock = controls
    ? `${ indented(controls, 2) }\n`
    : '';
  return `<div>
${ controlsBlock }${ indented(container, 2) }
${ validation }</div>`;
}

export function solidExample(meta: ExampleMeta): string {
  const model = modelType(meta);
  if (meta.composable) {
    return `import { For, createSignal } from 'solid-js';
import { toSolidProps, useHeadlessCombobox } from '@pdanpdan/headless-combobox-solid';

${ dataFor(meta) }

export function Example() {
  const [value, setValue] = createSignal<${ model }>(${ initialValue(meta) });
  const scope = useHeadlessCombobox(() => ({
    options: ${ optionsFor(meta) },
    value: value(),
    onChange: (next) => setValue(next as ${ model }),
    ${ extraOptions(meta).join('\n    ') }
  }));

  return (
${ indented(solidBody(meta), 4) }
  );
}
`;
  }

  const valueProps = meta.internal
    ? `      defaultValue="Vue"
`
    : `      value={value()}
      onChange={(next) => setValue(next as ${ model })}
`;
  const valueState = meta.internal
    ? ''
    : `  const [value, setValue] = createSignal<${ model }>(${ initialValue(meta) });\n`;
  const props = [
    `options={${ optionsFor(meta) }}`,
    ...extraProps(meta),
  ]
    .map((prop) => `      ${ prop }`)
    .join('\n');
  return `import { For, createSignal } from 'solid-js';
import { HeadlessCombobox, toSolidProps } from '@pdanpdan/headless-combobox-solid';

${ dataFor(meta) }

export function Example() {
${ valueState }
  return (
    <HeadlessCombobox
${ props }
${ valueProps }    >
      {(scope) => (
${ indented(solidBody(meta), 8) }
      )}
    </HeadlessCombobox>
  );
}
`;
}

function angularControls(meta: ExampleMeta): string {
  if (!meta.programmatic) {
    return '';
  }
  return `<div class="controls">
  <button type="button" (click)="combobox.open()">Open</button>
  <button type="button" (click)="combobox.close()">Close</button>
  <button type="button" (click)="combobox.select(users[1]!)">Select Arlene</button>
  <button type="button" (click)="combobox.clear()">Clear</button>
</div>
`;
}

function angularChips(meta: ExampleMeta, removable: boolean): string {
  if (!hasChips(meta) || (!removable && meta.chips !== 'trigger')) {
    return '';
  }
  const label = meta.object ? 'item.name' : 'item';
  const remove = removable
    ? ` <button type="button" (click)="s.select(item)">×</button>`
    : '';
  return `<div>
  @for (item of s.selectedList; track item) {
    <span>${ interpolation(label) }${ remove }</span>
  }
</div>`;
}

function angularTriggerContent(meta: ExampleMeta): string {
  if (meta.multiple) {
    if (meta.chips === 'trigger') {
      return `@for (item of s.selectedList; track item) {
  <span>${ interpolation(meta.object ? 'item.name' : 'item') }</span>
}
<span>${ interpolation(`s.selectedCount + '/' + ${ maxLength(meta) }`) }</span>`;
    }
    return interpolation("s.selectedCount ? s.selectedCount + ' selected' : 'Select…'");
  }
  if (meta.internal) {
    return meta.object
      ? interpolation("s.selectedList[0]?.name ?? 'Select…'")
      : interpolation("s.selectedList[0] ?? 'Select…'");
  }
  if (meta.object) {
    return meta.optionValue
      ? interpolation('selectedLabel()')
      : interpolation("value()?.name ?? 'Select…'");
  }
  return interpolation("value() ?? 'Select…'");
}

function angularField(meta: ExampleMeta): string {
  if (meta.typeahead) {
    const valueExpr = meta.multiple
      ? "s.searchQuery ?? ''"
      : "s.searchQuery ?? value() ?? ''";
    const input = `<input
  #input
  role="combobox"
  aria-label="Search"
  [attr.aria-controls]="s.comboboxInputProps['aria-controls']"
  [attr.aria-expanded]="s.comboboxInputProps['aria-expanded']"
  [attr.aria-haspopup]="s.comboboxInputProps['aria-haspopup']"
  [attr.aria-activedescendant]="s.comboboxInputProps['aria-activedescendant']"
  [attr.aria-disabled]="s.comboboxInputProps['aria-disabled'] || null"
  [attr.aria-readonly]="s.comboboxInputProps['aria-readonly'] || null"
  [disabled]="s.comboboxInputProps.disabled ?? false"
  [readOnly]="s.comboboxInputProps.readonly ?? false"
  [value]="${ valueExpr }"
  placeholder="Search…"
  (click)="s.comboboxInputProps.onClick()"
  (focus)="s.comboboxInputProps.onFocus()"
  (input)="s.comboboxInputProps.onInput($event)"
  (keydown)="s.comboboxInputProps.onKeydown($event)"
/>`;
    if (meta.chips === 'field') {
      return `<div>
${ indented(angularChips(meta, true), 2) }
${ indented(input, 2) }
</div>`;
    }
    return input;
  }
  const chips = meta.chips === 'removable'
    ? `${ angularChips(meta, true) }\n`
    : '';
  return `${ chips }<button
  #trigger
  type="button"
  role="combobox"
  [attr.aria-controls]="s.triggerProps['aria-controls']"
  [attr.aria-expanded]="s.triggerProps['aria-expanded']"
  [attr.aria-haspopup]="s.triggerProps['aria-haspopup']"
  [attr.aria-activedescendant]="s.triggerProps['aria-activedescendant']"
  [attr.aria-disabled]="s.triggerProps['aria-disabled'] || null"
  [attr.aria-readonly]="s.triggerProps['aria-readonly'] || null"
  [disabled]="s.triggerProps.disabled ?? false"
  (click)="s.triggerProps.onClick()"
  (keydown)="s.triggerProps.onKeydown($event)"
>
${ indented(angularTriggerContent(meta), 2) }
</button>`;
}

function angularList(meta: ExampleMeta): string {
  const filter = meta.filterInput
    ? `<div>
  <input
    #input
    role="searchbox"
    aria-label="Search"
    [attr.id]="s.inputProps.id"
    [attr.aria-controls]="s.inputProps['aria-controls']"
    [attr.aria-activedescendant]="s.inputProps['aria-activedescendant']"
    [value]="s.searchQuery ?? ''"
    placeholder="Search…"
    (input)="s.inputProps.onInput($event)"
    (keydown)="s.inputProps.onKeydown($event)"
  />
  <button type="button" (click)="s.clear()">Clear</button>
</div>
`
    : '';
  if (meta.grouped) {
    return `${ filter }<ul role="listbox">
  @for (group of groupedOptions(s.filteredOptions); track group.label) {
    <li role="group" [attr.aria-label]="group.label">
      <span aria-hidden="true">${ interpolation('group.label') }</span>
      @for (option of group.items; track option) {
        <button
          type="button"
          [id]="s.getOptionProps(option).id"
          role="option"
          [attr.aria-selected]="s.isSelected(option)"
          [attr.aria-posinset]="s.getOptionProps(option)['aria-posinset']"
          [attr.aria-setsize]="s.getOptionProps(option)['aria-setsize']"
          [attr.data-highlighted]="s.getOptionProps(option)['data-highlighted'] || null"
          (click)="s.select(option)"
          (mouseenter)="s.setHighlightedIndex(s.getOptionProps(option)['aria-posinset'] - 1)"
        >
          ${ interpolation("s.isSelected(option) ? '✓ ' : ''") }${ interpolation('option') }
        </button>
      }
    </li>
  }
</ul>`;
  }
  const indicator = meta.customOptions
    ? `<span aria-hidden="true">${ interpolation("s.isSelected(option) ? '✓' : '☐'") }</span>
      `
    : '';
  const valueText = meta.optionValue
    ? ` ${ interpolation('option.id') }`
    : '';
  return `${ filter }<ul role="listbox" [attr.id]="s.listboxProps.id" [attr.aria-multiselectable]="s.listboxProps['aria-multiselectable'] || null">
  @for (option of s.filteredOptions; track ${ optionKey(meta) }; let index = $index) {
    @let o = s.getOptionProps(option, index);
    <li
      [attr.id]="o.id"
      role="option"
      [attr.aria-selected]="o['aria-selected']"
      [attr.aria-disabled]="o['aria-disabled'] || null"
      [attr.aria-posinset]="o['aria-posinset']"
      [attr.aria-setsize]="o['aria-setsize']"
      [attr.data-highlighted]="o['data-highlighted'] || null"
      (click)="o.onClick()"
      (mousedown)="o.onMousedown($event)"
      (mouseenter)="o.onMousemove()"
      (focus)="o.onFocus()"
      (keydown)="o.onKeydown($event)"
    >
      ${ indicator }${ interpolation(optionText(meta)) }${ valueText }
    </li>
  }
</ul>`;
}

function angularBody(meta: ExampleMeta): string {
  const controls = angularControls(meta);
  const validation = meta.validation
    ? `  <p>${ interpolation("s.valid ? 'Looks good.' : s.validationMessage") }</p>\n`
    : '';
  const status = meta.status
    ? `  <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">${ interpolation('s.statusMessage') }</p>\n`
    : '';
  return `${ controls }<div #container>
${ indented(angularField(meta), 2) }
${ status }  @if (s.isOpen) {
    <div>
${ indented(angularList(meta), 6) }
    </div>
  }
</div>
${ validation }`;
}

export function angularExample(meta: ExampleMeta): string {
  const model = modelType(meta);
  const multipleProp = meta.multiple
    ? '      multiple: true,\n'
    : '';
  const validationProps = meta.validation
    ? '      required: true,\n      minLength: 2,\n      maxLength: 3,\n'
    : '';
  const extraOptionProps = [
    meta.selectOnTab ? '      selectOnTab: true,\n' : '',
    meta.alignSelected ? '      alignSelected: true,\n' : '',
    meta.maxLength
      ? `      maxLength: ${ meta.maxLength },\n`
      : '',
    meta.programmatic
      ? "      clickOutsideFilter: (target: EventTarget | null) => !(target instanceof HTMLElement && target.closest('.controls')),\n"
      : '',
    meta.object ? '      optionLabel: (user: User) => user.name,\n' : '',
    meta.optionValue ? '      optionValue: (user: User) => user.id,\n' : '',
  ].join('');
  const valueState = meta.internal
    ? ''
    : `  readonly value = signal<${ model }>(${ initialValue(meta) });\n`;
  const modelValue = meta.internal
    ? "      modelValue: 'Vue',\n"
    : '      modelValue: this.value(),\n';
  const onChange = meta.internal
    ? ''
    : `    onChange: (next) => this.value.set(next as ${ model }),\n`;
  const selectedLabel = meta.optionValue
    ? `  readonly selectedLabel = computed(
    () => users.find((user) => user.id === this.value())?.name ?? 'Select…',
  );\n`
    : '';
  const groupedHelper = meta.grouped
    ? '  readonly groupedOptions = groupedOptions;\n'
    : '';
  const computedImport = meta.optionValue
    ? ', computed'
    : '';
  const refs = !meta.internal || meta.typeahead
    ? `
  readonly container = viewChild<ElementRef<HTMLElement>>('container');
  readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly input = viewChild<ElementRef<HTMLElement>>('input');
`
    : '';
  const refsEffect = refs
    ? `
  constructor() {
    effect(() => {
      const snapshot = this.combobox.snapshot();
      snapshot.setContainerRef(this.container()?.nativeElement ?? null);
      snapshot.setTriggerRef(this.trigger()?.nativeElement ?? this.input()?.nativeElement ?? null);
      snapshot.setInputRef(this.input()?.nativeElement ?? null);
    });
  }
`
    : '';
  return `import { Component${ computedImport }, effect, ElementRef, signal, viewChild } from '@angular/core';
import { injectCombobox } from '@pdanpdan/headless-combobox-angular';

${ dataFor(meta) }

@Component({
  standalone: true,
  selector: 'app-example',
  template: \`
    @let s = combobox.snapshot();
${ indented(angularBody(meta), 4) }
  \`,
})
export class ExampleComponent {
${ valueState }${ selectedLabel }${ groupedHelper }  readonly combobox = injectCombobox({
    props: () => ({
      options: ${ optionsFor(meta) },
${ modelValue }${ multipleProp }${ validationProps }${ extraOptionProps }    }),
${ onChange }  });
${ refs }${ refsEffect }}
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
