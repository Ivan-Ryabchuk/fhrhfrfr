import { Alert, Platform } from "react-native";
import Constants from "expo-constants";

import { REWARDED_AD_UNIT_ID } from "./AdsConfig";

function isExpoGo(): boolean {
  return (
    Constants.executionEnvironment === "storeClient" ||
    (Constants as any).appOwnership === "expo"
  );
}

/**
 * Show `count` rewarded videos in sequence using Yandex Mobile Ads v8 API.
 * Returns true if all videos were rewarded successfully.
 * On web / Expo Go – demo mode.
 */
export async function watchRewardedVideos(count: number): Promise<boolean> {
  if (Platform.OS === "web" || isExpoGo()) {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        "Демо-режим",
        "В Expo Go реклама Яндекса недоступна.\nВ готовом APK (EAS Build) будет настоящая реклама.",
        [
          { text: "Открыть (демо)", onPress: () => resolve(true) },
          { text: "Отмена", style: "cancel", onPress: () => resolve(false) },
        ]
      );
    });
  }

  try {
    const { RewardedAdLoader } = require("yandex-mobile-ads") as {
      RewardedAdLoader: {
        create: () => Promise<{
          loadAd: (params: { adUnitId: string }) => Promise<{
            show: () => Promise<void>;
            onRewarded: ((reward: unknown) => void) | undefined;
            onAdDismissed: (() => void) | undefined;
            onAdFailedToShow: ((err: unknown) => void) | undefined;
          }>;
        }>;
      };
    };

    for (let i = 0; i < count; i++) {
      const result = await new Promise<boolean>(async (resolve) => {
        try {
          const loader = await RewardedAdLoader.create();
          const ad = await loader.loadAd({ adUnitId: REWARDED_AD_UNIT_ID });

          let rewarded = false;

          ad.onRewarded = () => {
            rewarded = true;
          };

          ad.onAdDismissed = () => {
            resolve(rewarded);
          };

          ad.onAdFailedToShow = (err: unknown) => {
            console.error("[YandexAds] Rewarded failed to show:", err);
            resolve(false);
          };

          await ad.show();
        } catch (err) {
          console.error("[YandexAds] Rewarded load/show error:", err);
          resolve(false);
        }
      });

      if (!result) return false;
    }

    return true;
  } catch (e) {
    console.error("[YandexAds] Module not available:", e);
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        "Реклама недоступна",
        "Не удалось загрузить модуль рекламы. Пересобери APK через EAS Build.",
        [
          { text: "Открыть (демо)", onPress: () => resolve(true) },
          { text: "Отмена", style: "cancel", onPress: () => resolve(false) },
        ]
      );
    });
  }
}
