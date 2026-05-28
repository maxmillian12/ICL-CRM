import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Android package name & iOS bundle ID
  appId: "co.tz.integrated.iclcrm",
  appName: "ICL CRM",

  // Point the app at the live Netlify deployment
  // This means no static export needed — the WebView loads the real app
  server: {
    url: "https://icl-crm-integrated.netlify.app",
    cleartext: false,
    // Allow self-signed certs in dev only
    androidScheme: "https",
    iosScheme: "https",
    allowNavigation: [
      "icl-crm-integrated.netlify.app",
      "ep-steep-frost-ak3uvl04-pooler.c-3.us-west-2.aws.neon.tech",
    ],
  },

  // Web directory (used when not using a remote server)
  webDir: "out",

  // Android config
  android: {
    buildOptions: {
      keystorePath: "release.keystore",
      keystoreAlias: "iclcrm",
    },
    backgroundColor: "#0D1117",
  },

  // iOS config
  ios: {
    backgroundColor: "#0D1117",
    contentInset: "always",
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0D1117",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "large",
      spinnerColor: "#00AAEE",
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#0D1117",
    },
  },
};

export default config;
