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

  // Use fractions of the viewport, not pixels: the snapshot box is
  // page-anchored and may be scaled on mobile, so a fraction of the box
  // always matches the toggle. Scroll offsets make the rect page-relative.
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
  const ratioX = (100 * x) / window.innerWidth;
  const ratioY = (100 * y) / window.innerHeight;
  // Cover the viewport: radius as a fraction of the box's half-diagonal.
  const endRadius = Math.hypot(
    Math.max(x - scrollX, scrollX + window.innerWidth - x),
    Math.max(y - scrollY, scrollY + window.innerHeight - y),
  );
  const halfDiagonal = Math.hypot(window.innerWidth, window.innerHeight) / Math.SQRT2;
  const ratioR = (100 * endRadius) / halfDiagonal;

  const transition = document.startViewTransition(() => {
    applyTheme(isDark);
  });
  // WAAPI avoids CSS variables: the values go straight to the pseudo-element.
  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0% at ${ ratioX }% ${ ratioY }%)`,
          `circle(${ ratioR }% at ${ ratioX }% ${ ratioY }%)`,
        ],
      },
      {
        duration: 600,
        easing: 'ease',
        pseudoElement: '::view-transition-new(root)',
      },
    );
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
/* Icons follow data-theme, not the checkbox, so they match from first paint. */
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
/* The reveal is animated from toggleTheme via WAAPI on ::view-transition-new(root);
   disable the UA cross-fade so the two don't fight. Reduced motion is handled in JS. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
}
</style>
