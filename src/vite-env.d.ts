/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: 'development' | 'production' | 'test';
  // add more environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

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
