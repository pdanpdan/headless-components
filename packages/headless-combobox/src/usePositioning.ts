import type { HeadlessComboboxDomRefs, HeadlessComboboxPopupStyle, HeadlessComboboxProps } from './useHeadlessCombobox';
import type { ComputedRef, Ref } from 'vue';

import { computed, nextTick, toRaw } from 'vue';

/** The selection pieces the popup positioning needs. */
export interface PositioningDeps<O, V> {
  selectedList: ComputedRef<V[]>;
  filteredOptions: ComputedRef<O[]>;
  highlightedIndex: Ref<number>;
  findOptionByValue: (value: V) => O | undefined;
}

function scrollElementIntoContainer(el: HTMLElement, container: HTMLElement | null) {
  if (!container) {
    return;
  }
  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  // Compensate for any CSS scale applied by the open animation: getBoundingClientRect
  // is scaled, but scrollTop is in unscaled content units.
  const scale = container.offsetWidth > 0 ? containerRect.width / container.offsetWidth : 1;
  const s = scale || 1;

  if (elRect.top < containerRect.top) {
    container.scrollTop -= (containerRect.top - elRect.top) / s;
  } else if (elRect.bottom > containerRect.bottom) {
    container.scrollTop += (elRect.bottom - containerRect.bottom) / s;
  }
}

/** The anchor style and the popup alignment (alignSelected) machinery. */
export function usePositioning<O, V, Q>(
  props: HeadlessComboboxProps<O, V, Q>,
  cssAnchorName: string,
  alignmentOffset: Ref<number>,
  refs: HeadlessComboboxDomRefs<O>,
  deps: PositioningDeps<O, V>,
) {
  // Default popup positioning — spread (or merge) onto the dropdown element's style.
  // No `position` is set: a popover gets `position: fixed` from the UA stylesheet,
  // and a regular element keeps the position you give it.
  const popupStyle = computed<HeadlessComboboxPopupStyle>(() => {
    const style: HeadlessComboboxPopupStyle = {
      positionAnchor: cssAnchorName,
      left: 'anchor(left)',
      width: 'anchor-size(width)',
      top: props.alignSelected ? 'anchor(top)' : 'anchor(bottom)',
    };
    if (props.alignSelected) {
      style.translate = `0 -${ alignmentOffset.value }px`;
    }
    return style;
  });

  function calculateAlignment() {
    const firstSelected = deps.selectedList.value[ 0 ];
    if (!refs.dropdownRef || !props.alignSelected || firstSelected == null) {
      alignmentOffset.value = 0;
      return;
    }

    const dropdownEl = refs.dropdownRef;
    const selectedOption = deps.findOptionByValue(firstSelected);
    const selectedEl = selectedOption == null ? undefined : refs.optionRefs.get(toRaw(selectedOption));
    if (selectedEl && refs.listRef) {
      scrollElementIntoContainer(selectedEl, refs.listRef);

      const dropdownRect = dropdownEl.getBoundingClientRect();
      const selectedRect = selectedEl.getBoundingClientRect();
      // The popup settles at scale 1, so divide out the current scale to get the
      // final (unscaled) offset. Both rects share the popup's scale, so the vector
      // difference scales by the same factor regardless of transform-origin.
      const scale = dropdownEl.offsetWidth > 0 ? dropdownRect.width / dropdownEl.offsetWidth : 1;
      alignmentOffset.value = (selectedRect.top - dropdownRect.top) / (scale || 1);
    } else {
      alignmentOffset.value = 0;
    }
  }

  async function scrollToHighlight() {
    await nextTick();
    const option = deps.filteredOptions.value[ deps.highlightedIndex.value ];
    if (!option) {
      return;
    }
    const el = refs.optionRefs.get(toRaw(option));
    if (el) {
      scrollElementIntoContainer(el, refs.listRef);
    }
  }

  return {
    popupStyle,
    scrollElementIntoContainer,
    calculateAlignment,
    scrollToHighlight,
  };
}
