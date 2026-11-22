import type { ComboboxContext } from './context';
import type { HeadlessComboboxDomRefs, HeadlessComboboxPopupStyle } from './types';

import { createMemo } from './context';

/** The selection pieces the popup positioning needs. */
export interface PositioningDeps<O, V> {
  getSelectedList: () => V[];
  getFilteredOptions: () => O[];
  findOptionByValue: (value: V) => O | undefined;
}

export function scrollElementIntoContainer(el: HTMLElement, container: HTMLElement | null) {
  if (!container) {
    return;
  }
  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  // Compensate for any CSS scale applied by the open animation: getBoundingClientRect
  // is scaled, but scrollTop is in unscaled content units.
  const scale = container.offsetWidth > 0
    ? containerRect.width / container.offsetWidth
    : 1;
  const s = scale || 1;

  if (elRect.top < containerRect.top) {
    container.scrollTop -= (containerRect.top - elRect.top) / s;
  } else if (elRect.bottom > containerRect.bottom) {
    container.scrollTop += (elRect.bottom - containerRect.bottom) / s;
  }
}

/** The anchor style and the popup alignment (alignSelected) machinery. */
export function createPositioning<O, V, Q>(
  ctx: ComboboxContext<O, V, Q>,
  cssAnchorName: string,
  refs: HeadlessComboboxDomRefs<O>,
  deps: PositioningDeps<O, V>,
) {
  // Default popup positioning: spread (or merge) onto the dropdown element's style.
  // No `position` is set: a popover gets `position: fixed` from the UA stylesheet,
  // and a regular element keeps the position you give it.
  const getPopupStyle = createMemo<HeadlessComboboxPopupStyle>(ctx)(() => {
    const style: HeadlessComboboxPopupStyle = {
      positionAnchor: cssAnchorName,
      left: 'anchor(left)',
      width: 'anchor-size(width)',
      top: ctx.props.alignSelected ? 'anchor(top)' : 'anchor(bottom)',
    };
    if (ctx.props.alignSelected) {
      style.translate = `0 -${ ctx.state.alignmentOffset }px`;
    }
    return style;
  });

  function calculateAlignment() {
    const firstSelected = deps.getSelectedList()[ 0 ];
    if (!refs.dropdownRef || !ctx.props.alignSelected || firstSelected == null) {
      ctx.mutate(() => {
        ctx.state.alignmentOffset = 0;
        ctx.bump();
      });
      return;
    }

    const dropdownEl = refs.dropdownRef;
    const selectedOption = deps.findOptionByValue(firstSelected);
    const selectedEl = selectedOption == null
      ? undefined
      : refs.optionRefs.get(ctx.unwrap(selectedOption));
    if (selectedEl && refs.listRef) {
      scrollElementIntoContainer(selectedEl, refs.listRef);

      const dropdownRect = dropdownEl.getBoundingClientRect();
      const selectedRect = selectedEl.getBoundingClientRect();
      // The popup settles at scale 1, so divide out the current scale to get the
      // final (unscaled) offset. Both rects share the popup's scale, so the vector
      // difference scales by the same factor regardless of transform-origin.
      const scale = dropdownEl.offsetWidth > 0
        ? dropdownRect.width / dropdownEl.offsetWidth
        : 1;
      ctx.mutate(() => {
        ctx.state.alignmentOffset = (selectedRect.top - dropdownRect.top) / (scale || 1);
        ctx.bump();
      });
    } else {
      ctx.mutate(() => {
        ctx.state.alignmentOffset = 0;
        ctx.bump();
      });
    }
  }

  async function scrollToHighlight() {
    await ctx.nextTick();
    const option = deps.getFilteredOptions()[ ctx.state.highlightedIndex ];
    if (!option) {
      return;
    }
    const el = refs.optionRefs.get(ctx.unwrap(option));
    if (el) {
      scrollElementIntoContainer(el, refs.listRef);
    }
  }

  return {
    getPopupStyle,
    scrollElementIntoContainer,
    calculateAlignment,
    scrollToHighlight,
  };
}
