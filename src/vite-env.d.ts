/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_BASE_URL: string;
  /** Server root for uploads (no `/api/v1`), e.g. `10.10.7.10:8001` */
  readonly IMAGE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
