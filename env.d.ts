interface ImportMetaEnv {
  readonly VITE_WEBSOCKET_URL?: string;
  // Add other environment variables here as needed.
  // For example:
  // readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}