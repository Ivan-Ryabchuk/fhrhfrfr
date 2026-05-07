const {
  withAppBuildGradle,
  withSettingsGradle,
  withAndroidManifest,
} = require("@expo/config-plugins");

const YANDEX_MAVEN = `maven { url "https://artifactory.mobileadx.ru/artifactory/yandexmobile" }`;

/**
 * Configures Yandex Mobile Ads SDK for Android EAS builds.
 *
 * React Native 0.73+ uses dependencyResolutionManagement in settings.gradle
 * instead of allprojects in build.gradle. We patch BOTH to be safe.
 */
function withYandexAds(config) {
  // 1. settings.gradle — primary location for repos in RN 0.73+
  config = withSettingsGradle(config, (conf) => {
    if (conf.modResults.contents.includes("mobileadx.ru")) return conf;

    // Insert inside dependencyResolutionManagement { repositories { ... } }
    if (conf.modResults.contents.includes("dependencyResolutionManagement")) {
      conf.modResults.contents = conf.modResults.contents.replace(
        /(dependencyResolutionManagement\s*\{[^}]*repositories\s*\{)/,
        `$1\n        ${YANDEX_MAVEN}`
      );
    } else {
      // Fallback: append at end of file
      conf.modResults.contents += `\n// Yandex Mobile Ads repository\n`;
    }
    return conf;
  });

  // 2. app/build.gradle — fallback for older RN / safety net
  config = withAppBuildGradle(config, (conf) => {
    if (conf.modResults.contents.includes("mobileadx.ru")) return conf;

    // Insert after repositories { in android block if present
    conf.modResults.contents = conf.modResults.contents.replace(
      /(repositories\s*\{)/,
      `$1\n        ${YANDEX_MAVEN}`
    );
    return conf;
  });

  // 3. AndroidManifest.xml permissions
  config = withAndroidManifest(config, async (conf) => {
    const manifest = conf.modResults.manifest;
    const required = [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.ACCESS_WIFI_STATE",
      "com.google.android.gms.permission.AD_ID",
    ];
    const existing = (manifest["uses-permission"] || []).map(
      (p) => p.$["android:name"]
    );
    for (const perm of required) {
      if (!existing.includes(perm)) {
        if (!manifest["uses-permission"]) manifest["uses-permission"] = [];
        manifest["uses-permission"].push({ $: { "android:name": perm } });
      }
    }
    return conf;
  });

  return config;
}

module.exports = withYandexAds;
