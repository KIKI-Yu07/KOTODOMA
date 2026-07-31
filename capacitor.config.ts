import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kotodama.app',
  appName: '言霊',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'kotodama.app',
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
