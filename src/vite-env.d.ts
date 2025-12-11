/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_ALLOWED_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}