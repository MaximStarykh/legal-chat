/// <reference types="vite/client" />

// This tells TypeScript that .jsx and .tsx files can contain JSX
declare module '*.jsx' {
  import type { DefineComponent } from 'react';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.tsx' {
  import type { DefineComponent } from 'react';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
