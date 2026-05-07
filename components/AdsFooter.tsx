import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";

import { BANNER_AD_UNIT_ID } from "@/utils/AdsConfig";

function isExpoGo(): boolean {
  return (
    Constants.executionEnvironment === "storeClient" ||
    (Constants as any).appOwnership === "expo"
  );
}

/**
 * Sticky banner ad strip.
 * Native EAS build: real Yandex BannerView with stickySize.
 * Web / Expo Go: silent empty view — no SDK calls made.
 */
export default function AdsFooter() {
  const [bannerSize, setBannerSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (Platform.OS === "web" || isExpoGo()) return;
    try {
      const { BannerAdSize } = require("yandex-mobile-ads") as {
        BannerAdSize: { stickySize: (w: number) => Promise<{ width: number; height: number }> };
      };
      const screenWidth = Math.floor(Dimensions.get("window").width);
      BannerAdSize.stickySize(screenWidth)
        .then((size) => setBannerSize(size))
        .catch((e: unknown) => console.error("[YandexAds] stickySize error:", e));
    } catch (e) {
      console.error("[YandexAds] BannerAdSize not available:", e);
    }
  }, []);

  if (Platform.OS === "web" || isExpoGo()) {
    return <View style={styles.fallback} />;
  }

  try {
    const { BannerView } = require("yandex-mobile-ads") as {
      BannerView: React.ComponentType<{
        adUnitId: string;
        size: { width: number; height: number };
        onAdLoaded?: () => void;
        onAdFailedToLoad?: (e: unknown) => void;
        style?: object;
      }>;
    };

    if (!bannerSize) {
      return <View style={styles.fallback} />;
    }

    return (
      <View style={[styles.container, { height: bannerSize.height }]}>
        <BannerView
          adUnitId={BANNER_AD_UNIT_ID}
          size={bannerSize}
          onAdLoaded={() => {}}
          onAdFailedToLoad={(e) => console.error("[YandexAds] Banner failed:", e)}
          style={{ width: bannerSize.width, height: bannerSize.height }}
        />
      </View>
    );
  } catch (e) {
    console.error("[YandexAds] BannerView not available:", e);
    return <View style={styles.fallback} />;
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050510",
  },
  fallback: {
    height: 50,
  },
});
