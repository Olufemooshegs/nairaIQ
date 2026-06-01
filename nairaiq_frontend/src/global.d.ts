/// <reference types="vite/client" />

declare module '*.css';
declare module '*.scss';

declare interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
