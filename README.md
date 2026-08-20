# headless-components

Monorepo of headless (unstyled) Vue 3 components. Each component is a standalone, publishable package that ships no styles — style them with daisyUI 5 / Tailwind 4.

## Packages

| Package | Description |
|---------|-------------|
| `@pdanpdan/headless-combobox` | Accessible, renderless combobox with filtering and keyboard navigation |

## Development

```bash
pnpm install
pnpm dev          # start playground
pnpm lint         # lint all
pnpm typecheck    # type-check all packages
pnpm test         # run tests
pnpm test:all     # lint + typecheck + test
pnpm release      # test:all + version bump + CHANGELOG + git tag + GitHub release (release-it)
pnpm release:npm  # publish packages to npm (run by hand after release — interactive OTP)
```

## License

MIT
