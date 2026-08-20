# Changelog

# [1.0.0](https://github.com/pdanpdan/headless-components/compare/v0.2.0...v1.0.0) (2026-08-20)

* feat!: expose selectedList and seed the internal-state example ([eb50d94](https://github.com/pdanpdan/headless-components/commit/eb50d944f41f622d1196420fb4d854e7620ccd2b))
* feat!: rename displayValue/filterFn and add optionValue ([78f1935](https://github.com/pdanpdan/headless-components/commit/78f193520a4b855a0cfab8256eeaff8dd64cd3ff))
* fix!: reset popover inset so position-try flips popups ([3c1fdb7](https://github.com/pdanpdan/headless-components/commit/3c1fdb728b6956982d24327c46c37a8c214607a6))

### Bug Fixes

* make code block and heading focus states visible ([4083a31](https://github.com/pdanpdan/headless-components/commit/4083a31cf7d6dcfb2ce55704b8f84dc350778d24))

### Features

* add composable examples with standalone metadata ([ed2dcb8](https://github.com/pdanpdan/headless-components/commit/ed2dcb8efeef35bbd864f412f56c233a9538f76c))
* add heading anchors and on-this-page table of contents ([9575d1a](https://github.com/pdanpdan/headless-components/commit/9575d1ada11be127ac170dd5a04409b6deaf674d))
* add internal-state example ([3494fec](https://github.com/pdanpdan/headless-components/commit/3494fec4c549a6b652a31ef99320e89508ec2190))
* add paged, Home/End, and Tab-skip keyboard navigation ([cc30d71](https://github.com/pdanpdan/headless-components/commit/cc30d71f67b3a55b33d60d0ce2a1211fbe357572))
* add select-on-tab example ([4d0f7fc](https://github.com/pdanpdan/headless-components/commit/4d0f7fc9ea207d27d9365f428e28f8f0190748cd))
* add separate-value example ([f152ed9](https://github.com/pdanpdan/headless-components/commit/f152ed946809f57b9754e9b5dd7859e07d357c89))
* add sticky on-this-page dropdown with scroll-state corners ([f68b155](https://github.com/pdanpdan/headless-components/commit/f68b155ad557867c755650f0afffd0078edb16bf))
* add theme toggle with circular page reveal ([130d6cf](https://github.com/pdanpdan/headless-components/commit/130d6cf8a7619751bba15d4bfb23ec06f30384be))
* extract useHeadlessCombobox composable ([8503492](https://github.com/pdanpdan/headless-components/commit/85034921b3be6d8e4e62021cbd5d1d0ebafa5044))
* keep selection internally without a v-model listener ([dbfc6bc](https://github.com/pdanpdan/headless-components/commit/dbfc6bcc6844a413fcc34407fde2ca278089f4e5))

### BREAKING CHANGES

* displayValue is now optionLabel and filterFn is now
  optionFilter; the generic parameters of HeadlessComboboxProps changed
  from <T, Q> to <O, V = O, Q>.
* HeadlessComboboxSlotProps and HeadlessComboboxScope now
  take the value type V (e.g. HeadlessComboboxSlotProps<O, V, Q>), so
  single-argument uses need an explicit V.
* popupStyle no longer sets `position` — the popover UA
  supplies `position: fixed`, so the style object works standalone; set
  `position` yourself if you relied on the previous value.

# [0.2.0](https://github.com/pdanpdan/headless-components/compare/v0.1.0...v0.2.0) (2026-08-07)

### Bug Fixes

* **combobox:** reopen and filter when typing in the typeahead input after Escape ([fe3f133](https://github.com/pdanpdan/headless-components/commit/fe3f133a0f297202330faf6e8396fd5cca984e5d))
* **playground:** make menu hover states visible in both themes ([5a26bf8](https://github.com/pdanpdan/headless-components/commit/5a26bf8054f1173900826c64220bdc3ccb15fcbf))
* use import.meta.dirname in vite config ([c2f07f5](https://github.com/pdanpdan/headless-components/commit/c2f07f5a8abcba1f476756e415c741f8201739ef))

### Features

* **combobox:** polish examples — cursor affordances, primary hover/focus highlights, removable chips, custom option styling, v-bind-only wiring ([e4adba1](https://github.com/pdanpdan/headless-components/commit/e4adba13160758d1bed46ee074fbcd7d55137a4b))
* **combobox:** wire interaction handlers into prop bags, skip blocked options in keyboard navigation, close on Escape from anywhere ([fc3cad7](https://github.com/pdanpdan/headless-components/commit/fc3cad7afe6c0f6766c263caa0bb7b3efe5eeb59))
* **playground:** add GitHub links and new combobox showcases ([3855a01](https://github.com/pdanpdan/headless-components/commit/3855a0119712093bc5de2a69e1f3191b684820d8))
* **playground:** add MDI icon component using @mdi/js ([18ae4ca](https://github.com/pdanpdan/headless-components/commit/18ae4ca3d3b5bfb9f34dff563f9f243791e04746))
* **playground:** custom green light/dark themes with persisted theme toggle ([266c99c](https://github.com/pdanpdan/headless-components/commit/266c99c83708dcc6195cd3ab8ade2fa692c6e82b))

# 0.1.0 (2026-08-07)

### Features

* add first component - combobox ([a2d26c1](https://github.com/pdanpdan/headless-components/commit/a2d26c1380f874fcdf37708510f983f30ec350cd))
* add playground with docs for combobox ([685ad5f](https://github.com/pdanpdan/headless-components/commit/685ad5f9e8f8c0904a3f5ac0289ab52e492b0d25))
