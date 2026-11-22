/// <reference types="vite/client" />
/// <reference types="vue/dist/vue" />

declare module '*?highlight' {
  export const raw: string;
  export const html: string;
  const content: {
    raw: string;
    html: string;
  };
  export default content;
}

declare module 'virtual:adapter-examples' {
  import type { AdapterId } from './lib/adapter-examples';

  const examples: Record<string, Record<AdapterId, { raw: string; html: string; }>>;
  export default examples;
}
