import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kotodama.app',
  appName: '言霊',
  webDir: 'dist',
  server: {
    url: 'https://kotodama-ei9.pages.dev',
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
