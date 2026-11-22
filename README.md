# headless-components

Headless UI state machines with adapters for Vue, React, Svelte, Solid, and Angular. Packages ship without styles. Use daisyUI 5 or Tailwind 4 to style them.

## Packages

| Package | Description |
|---------|-------------|
| [`@pdanpdan/headless-combobox-core`](packages/headless-combobox-core) | Framework-independent combobox state machine |
| [`@pdanpdan/headless-combobox-vue`](packages/headless-combobox-vue/README.md) | Vue 3 component and `useHeadlessCombobox` composable |
| [`@pdanpdan/headless-combobox-react`](packages/headless-combobox-react/README.md) | React hook and render-prop component |
| [`@pdanpdan/headless-combobox-svelte`](packages/headless-combobox-svelte/README.md) | Svelte store and renderless component |
| [`@pdanpdan/headless-combobox-solid`](packages/headless-combobox-solid/README.md) | Solid hook and render-prop component |
| [`@pdanpdan/headless-combobox-angular`](packages/headless-combobox-angular/README.md) | Angular signals store and `injectCombobox` |

The core implements selection, filtering, validation, keyboard navigation, popup lifecycle, anchoring, and focus management. Each adapter maps the core snapshot to its framework's state primitive and supplies DOM refs.

The Vue package was renamed from `@pdanpdan/headless-combobox` to `@pdanpdan/headless-combobox-vue` in v3. Its public API is otherwise unchanged.

## Development

```bash
pnpm install:packages # install all workspace packages
pnpm dev              # start playground
pnpm lint             # lint all
pnpm typecheck        # type-check all packages
pnpm test             # run tests
pnpm test:all         # lint + typecheck + test
pnpm update:packages  # interactively update every package to the latest stable versions
```

### Release

All packages share one version and one root [`CHANGELOG.md`](CHANGELOG.md).

```bash
pnpm release      # test:all, bump every package, update CHANGELOG, tag, GitHub release
pnpm release:npm  # publish all packages in dependency order (interactive OTP)
```

## License

MIT
