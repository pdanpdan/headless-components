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
