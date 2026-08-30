import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nutrivision.app',
  appName: 'NutriVision',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
