import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AdsFooter from "@/components/AdsFooter";
import CyberBg from "@/components/CyberBg";

const BG = "#050510";
const CYAN = "#00FFFF";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CyberBg />

      <Pressable onPress={() => router.back()} style={styles.backArea} hitSlop={16} />

      <View style={styles.body}>
        {/* Developer card */}
        <View style={styles.card}>
          <Text style={styles.devTitle}>
            Developer: Ivan Ryabchuk | Studio: Ryabchuk Dev
          </Text>
          <Text style={styles.devDesc}>
            Мобильная party-игра «Самозванец».{"\n"}Спасибо, что играете!
          </Text>
        </View>
      </View>

      {/* Version footer */}
      <View style={styles.versionRow}>
        <Text style={styles.versionText}>· FIND IMPOSTER · V 1.0.0</Text>
      </View>

      <AdsFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  backArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 32,
    zIndex: 1,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  devTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },
  devDesc: {
    color: "#333",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  versionRow: {
    alignItems: "center",
    paddingVertical: 14,
    zIndex: 1,
  },
  versionText: {
    color: "rgba(0,255,255,0.35)",
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "monospace",
  },
});
