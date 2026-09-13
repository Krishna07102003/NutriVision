import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.poshaniq.app',
  appName: 'Poshaniq',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
