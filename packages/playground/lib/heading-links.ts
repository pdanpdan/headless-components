export interface HeadingLink {
  id: string;
  text: string;
  level: number;
}

const LINKED_MARKER = 'data-heading-linked';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Adds an id and an anchor link wrapping the whole heading text to every
 * `h1`–`h6` inside `root` (GitHub-style: the title itself links to the hash;
 * a `#` span is revealed on hover / focus-visible). Idempotent: headings
 * already processed are skipped. Returns the headings for the table of
 * contents.
 */
export function injectHeadingLinks(root: HTMLElement): HeadingLink[] {
  const seen = new Map<string, number>();
  const headings = root.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6');

  for (const heading of headings) {
    if (heading.hasAttribute(LINKED_MARKER)) {
      continue;
    }
    const text = heading.textContent?.trim() ?? '';
    const base = heading.id || slugify(text) || 'section';
    const count = seen.get(base) ?? 0;
    const id = count === 0 ? base : `${ base }-${ count + 1 }`;
    seen.set(base, count + 1);
    heading.id = id;
    heading.dataset.headingText = text;

    const hash = document.createElement('span');
    hash.className = 'heading-hash';
    hash.setAttribute('aria-hidden', 'true');
    hash.textContent = '#';

    const link = document.createElement('a');
    link.className = 'heading-link';
    link.href = `#${ id }`;
    // The link wraps the whole title; move the heading's children into it.
    while (heading.firstChild) {
      link.append(heading.firstChild);
    }
    link.prepend(hash);
    heading.append(link);
    heading.setAttribute(LINKED_MARKER, '');
  }

  return collectHeadings(root);
}

/** Collects `h2`–`h3` headings for the table of contents. */
export function collectHeadings(root: HTMLElement): HeadingLink[] {
  return [ ...root.querySelectorAll<HTMLHeadingElement>('h2, h3') ]
    .map((heading) => ({
      id: heading.id,
      // The injected anchor wraps the title; use the text stashed at injection.
      text: heading.dataset.headingText ?? heading.textContent?.trim() ?? '',
      level: Number(heading.tagName[ 1 ]),
    }))
    .filter((heading) => heading.id !== '' && heading.text !== '');
}
