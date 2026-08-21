<script setup lang="ts">
import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
import { onMounted, ref } from 'vue';

import MdiIcon from '#/components/MdiIcon.vue';

const labelEl = ref<HTMLLabelElement>();
const inputEl = ref<HTMLInputElement>();

function applyTheme(isDark: boolean) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function toggleTheme(event: Event) {
  const isDark = (event.target as HTMLInputElement).checked;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion) {
    applyTheme(isDark);
    return;
  }

  // Circle reveal geometry: the smallest circle centered on the toggle that
  // covers the whole viewport. The root view-transition snapshot is a
  // viewport-sized box anchored at the top-left of the PAGE (not the
  // viewport), so the clip-path coordinates must be page-relative. The rect
  // is viewport-relative, hence the scroll offsets: without them the circle
  // starts above the screen once the page is scrolled (e.g. on phones).
  const label = labelEl.value;
  if (!label) {
    applyTheme(isDark);
    return;
  }
  const rect = label.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const x = rect.left + rect.width / 2 + scrollX;
  const y = rect.top + rect.height / 2 + scrollY;
  const radius = Math.hypot(
    Math.max(x - scrollX, scrollX + window.innerWidth - x),
    Math.max(y - scrollY, scrollY + window.innerHeight - y),
  );

  const root = document.documentElement;
  root.style.setProperty('--theme-reveal-x', `${ x }px`);
  root.style.setProperty('--theme-reveal-y', `${ y }px`);
  root.style.setProperty('--theme-reveal-r', `${ radius }px`);

  document.startViewTransition(() => {
    applyTheme(isDark);
  });
}

onMounted(() => {
  const savedTheme = window.localStorage.getItem('theme');
  const isDark = savedTheme === 'dark'
    || (savedTheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  if (inputEl.value) {
    inputEl.value.checked = isDark;
  }
});
</script>

<template>
  <label
    ref="labelEl"
    class="toggle-theme swap swap-rotate"
    title="Toggle light/dark theme"
  >
    <input
      ref="inputEl"
      type="checkbox"
      aria-label="Toggle light/dark theme"
      @change="toggleTheme"
    />
    <MdiIcon :path="mdiWhiteBalanceSunny" class="size-6 swap-off" />
    <MdiIcon :path="mdiWeatherNight" class="size-6 swap-on" />
  </label>
</template>

<style scoped>
/* Drive the icon state (opacity + rotation) from `data-theme` (set by theme.js
   before first paint, and by the media query before hydration) instead of the
   checkbox state, so the icons match the theme — including the swap-rotate
   tilt — from the very first frame. */
:root[data-theme="light"] .toggle-theme {
  .swap-on {
    opacity: 0;
    rotate: 45deg;
  }
  .swap-off {
    opacity: 1;
    rotate: 0deg;
  }
}
:root[data-theme="dark"] .toggle-theme {
  .swap-on {
    opacity: 1;
    rotate: 0deg;
  }
  .swap-off {
    opacity: 0;
    rotate: -45deg;
  }
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) .toggle-theme {
    .swap-on {
      opacity: 1;
      rotate: 0deg;
    }
    .swap-off {
      opacity: 0;
      rotate: -45deg;
    }
  }
}
</style>

<style>
/* Circular page reveal growing from the toggle button (View Transitions API).
   These target page-level ::view-transition snapshots, so they cannot be
   scoped. Geometry comes from the toggle position via CSS custom properties
   set in `toggleTheme`. */
::view-transition-old(root) {
  animation: none;
}
/* The circle reveal is applied only when the user has not requested reduced
   motion; under reduce the new snapshot appears instantly (the JS also skips
   the view transition entirely). */
::view-transition-new(root) {
  @media (prefers-reduced-motion: no-preference) {
    animation: theme-reveal 0.6s ease;
  }
}
@keyframes theme-reveal {
  from {
    clip-path: circle(0px at var(--theme-reveal-x) var(--theme-reveal-y));
  }
  to {
    clip-path: circle(var(--theme-reveal-r) at var(--theme-reveal-x) var(--theme-reveal-y));
  }
}
</style>
