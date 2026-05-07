import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";
import { ms, s, vs } from "@/utils/scaling";

const { width } = Dimensions.get("window");

const CYAN = "#00FFFF";
const MAGENTA = "#FF00FF";
const YELLOW = "#FFE600";
const BG = "#050510";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.82)).current;
  const scanY = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem("welcome_seen").then((val) => {
      if (val === "1") {
        router.replace("/home");
        return;
      }

      // Fade + scale in
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(titleScale, { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }),
        Animated.timing(badgeOpacity, { toValue: 1, duration: 1200, delay: 400, useNativeDriver: true }),
      ]).start();

      // Scan-line loop
      Animated.loop(
        Animated.timing(scanY, { toValue: 1, duration: 2800, useNativeDriver: true })
      ).start();

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.4, duration: 1600, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  function handleEnter() {
    AsyncStorage.setItem("welcome_seen", "1");
    router.replace("/home");
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  // Scan line travels over the title card height (~220)
  const CARD_H = vs(220);
  const scanTranslate = scanY.interpolate({
    inputRange: [0, 1],
    outputRange: [-CARD_H / 2, CARD_H * 1.5],
  });

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CyberBg />

      <Animated.View style={[styles.inner, { opacity, transform: [{ scale: titleScale }] }]}>

        {/* ── Title card ── */}
        <View style={[styles.card, { width: width - s(48) }]}>
          {/* Corner accents */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Top label */}
          <Text style={styles.topLabel}>// RYABCHUK DEV //</Text>

          {/* Main title */}
          <Animated.Text style={[styles.title, { opacity: glowOpacity }]}>
            САМО-
          </Animated.Text>
          <Text style={styles.title}>ЗВАНЕЦ</Text>

          {/* Subtitle */}
          <View style={styles.subtitleRow}>
            <View style={styles.subtitleLine} />
            <Text style={styles.subtitle}>КИБЕРПАНК · ИГРА</Text>
            <View style={styles.subtitleLine} />
          </View>

          {/* Scan line */}
          <Animated.View
            style={[
              styles.scanLine,
              { width: width - s(48) - 4, transform: [{ translateY: scanTranslate }] },
            ]}
            pointerEvents="none"
          />
        </View>

        {/* ── Stats row ── */}
        <Animated.View style={[styles.statsRow, { opacity: badgeOpacity }]}>
          <View style={styles.statBadge}>
            <Text style={styles.statNum}>23</Text>
            <Text style={styles.statLabel}>КАТЕГОРИИ</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statBadge}>
            <Text style={[styles.statNum, { color: MAGENTA }]}>300+</Text>
            <Text style={styles.statLabel}>СЛОВА</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statBadge}>
            <Text style={[styles.statNum, { color: YELLOW }]}>4</Text>
            <Text style={styles.statLabel}>СЛОТА</Text>
          </View>
        </Animated.View>

        {/* ── Enter button ── */}
        <Pressable
          style={({ pressed }) => [styles.enterBtn, pressed && styles.enterBtnPressed]}
          onPress={handleEnter}
        >
          <Text style={styles.enterBtnText}>[ ВОЙТИ В СИСТЕМУ ]</Text>
        </Pressable>

        {/* ── Studio tag ── */}
        <Text style={styles.studioTag}>// INDIE GAME STUDIO //</Text>
      </Animated.View>
    </View>
  );
}

const CORNER = s(18);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    alignItems: "center",
    gap: vs(20),
    paddingHorizontal: s(24),
  },

  /* Card */
  card: {
    backgroundColor: "rgba(0,255,255,0.035)",
    borderWidth: 1.5,
    borderColor: "rgba(0,255,255,0.25)",
    borderRadius: s(6),
    paddingVertical: vs(32),
    paddingHorizontal: s(24),
    alignItems: "center",
    gap: vs(8),
    overflow: "hidden",
  },
  topLabel: {
    color: "rgba(255,0,255,0.55)",
    fontSize: ms(9),
    letterSpacing: 3,
    fontFamily: "monospace",
    marginBottom: vs(4),
  },
  title: {
    color: CYAN,
    fontSize: ms(52, 0.6),
    fontWeight: "900",
    letterSpacing: s(6),
    textShadowColor: CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(22),
    lineHeight: ms(58, 0.6),
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(10),
    marginTop: vs(4),
  },
  subtitleLine: {
    flex: 1,
    height: 1,
    backgroundColor: CYAN,
    opacity: 0.25,
  },
  subtitle: {
    color: "rgba(224,224,255,0.45)",
    fontSize: ms(10),
    letterSpacing: 3,
    fontFamily: "monospace",
  },
  /* Scan line */
  scanLine: {
    position: "absolute",
    height: 2,
    backgroundColor: CYAN,
    opacity: 0.12,
    left: 2,
  },
  /* Corner decorations */
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: CYAN,
    opacity: 0.7,
  },
  cornerTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2, borderRadius: 0 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2, borderRadius: 0 },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2, borderRadius: 0 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderRadius: 0 },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(16),
  },
  statBadge: {
    alignItems: "center",
    gap: vs(2),
  },
  statNum: {
    color: CYAN,
    fontSize: ms(20),
    fontWeight: "900",
    letterSpacing: 1,
    textShadowColor: CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statLabel: {
    color: "rgba(224,224,255,0.35)",
    fontSize: ms(8),
    letterSpacing: 2,
    fontFamily: "monospace",
  },
  statDivider: {
    width: 1,
    height: vs(32),
    backgroundColor: "rgba(0,255,255,0.18)",
  },

  /* Button */
  enterBtn: {
    borderWidth: 1.5,
    borderColor: CYAN,
    borderRadius: s(4),
    paddingVertical: vs(16),
    paddingHorizontal: s(40),
    backgroundColor: "rgba(0,255,255,0.06)",
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: s(16),
    elevation: 8,
    marginTop: vs(4),
  },
  enterBtnPressed: {
    backgroundColor: "rgba(0,255,255,0.14)",
    opacity: 0.88,
  },
  enterBtnText: {
    color: CYAN,
    fontSize: ms(15),
    fontWeight: "900",
    letterSpacing: s(3),
    textShadowColor: CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  /* Studio tag */
  studioTag: {
    color: "rgba(255,0,255,0.35)",
    fontSize: ms(8),
    letterSpacing: 3,
    fontFamily: "monospace",
  },
});
