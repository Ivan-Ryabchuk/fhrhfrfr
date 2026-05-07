import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AdsFooter from "@/components/AdsFooter";
import CyberBg from "@/components/CyberBg";
import PixelDragon from "@/components/PixelDragon";

const CYAN = "#00FFFF";
const MAGENTA = "#FF00FF";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const dragonY = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.6)).current;
  const btnScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(titleScale, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 8 }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(dragonY, { toValue: -12, duration: 2400, useNativeDriver: true }),
        Animated.timing(dragonY, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CyberBg />
      <Animated.View style={[styles.inner, { opacity: fadeIn }]}>

        <Animated.View style={{ transform: [{ scale: titleScale }] }}>
          <View style={styles.titleRow}>
            <View style={styles.titleLine} />
            <Text style={styles.title}>САМОЗВАНЕЦ</Text>
            <View style={styles.titleLine} />
          </View>
          <Text style={styles.subtitle}>// КИБЕРПАНК ВЕРСИЯ //</Text>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: dragonY }], marginVertical: 16 }}>
          <PixelDragon scale={0.85} />
        </Animated.View>

        <Text style={styles.desc}>Игра слов · Найди шпиона в своей команде</Text>

        <Animated.View style={[styles.buttons, { transform: [{ scale: btnScale }] }]}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
            onPress={() => router.push("/setup")}
          >
            <Feather name="zap" size={18} color="#000" />
            <Text style={styles.btnPrimaryText}>НАЧАТЬ ИГРУ</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnSecPressed]}
            onPress={() => router.push("/rules")}
          >
            <Feather name="file-text" size={16} color={CYAN} />
            <Text style={styles.btnSecondaryText}>КАК ИГРАТЬ</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnAbout, pressed && styles.btnSecPressed]}
            onPress={() => router.push("/about")}
          >
            <Feather name="user" size={14} color="rgba(0,255,255,0.75)" />
            <Text style={styles.btnAboutText}>ОБ АВТОРЕ</Text>
          </Pressable>
        </Animated.View>

        {/* RYABCHUK DEV signature */}
        <Text style={styles.signature}>// RYABCHUK DEV //</Text>
      </Animated.View>

      <AdsFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050510",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleLine: {
    flex: 1,
    height: 2,
    backgroundColor: CYAN,
    opacity: 0.4,
  },
  title: {
    color: CYAN,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    textAlign: "center",
    color: "rgba(255,0,255,0.65)",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "monospace",
    marginTop: 4,
  },
  desc: {
    color: "rgba(224,224,255,0.5)",
    fontSize: 12,
    letterSpacing: 1,
    textAlign: "center",
  },
  buttons: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: CYAN,
    borderRadius: 4,
    paddingVertical: 16,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 10,
  },
  btnPrimaryPressed: { opacity: 0.85 },
  btnPrimaryText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: CYAN,
    borderRadius: 4,
    paddingVertical: 14,
    backgroundColor: "rgba(0,255,255,0.05)",
  },
  btnSecPressed: { opacity: 0.75 },
  btnSecondaryText: {
    color: CYAN,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },
  btnAbout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  btnAboutText: {
    color: "rgba(0,255,255,0.75)",
    fontSize: 12,
    letterSpacing: 1,
  },
  signature: {
    color: "rgba(255,0,255,0.35)",
    fontSize: 9,
    letterSpacing: 3,
    fontFamily: "monospace",
    marginTop: 8,
  },
});
