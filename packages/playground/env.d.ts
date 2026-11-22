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

  interface ExampleSource {
    raw: string;
    html: string;
  }

  const examples: Record<string, {
    title: string;
    description: string;
    sources: Record<AdapterId, ExampleSource>;
  }>;
  export default examples;
}
