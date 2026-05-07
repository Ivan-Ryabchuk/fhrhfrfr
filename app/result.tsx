import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";
import { useGame } from "@/contexts/GameContext";

const CYAN = "#00FFFF";
const RED = "#FF0055";
const MAGENTA = "#FF00FF";
const BG = "#050510";
const CARD = "rgba(0,255,255,0.04)";
const BORDER = "rgba(0,255,255,0.18)";

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const { roundRoles, resetGame } = useGame();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const impostors = roundRoles.filter((r) => r.isImpostor);
  const players = roundRoles.filter((r) => !r.isImpostor);
  const word = players[0]?.word ?? "";
  const category = players[0]?.category ?? "";

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CyberBg />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => { resetGame(); router.replace("/home"); }}>
          <Feather name="home" size={18} color="rgba(0,255,255,0.5)" />
        </Pressable>
        <Text style={styles.headerTitle}>РЕЗУЛЬТАТЫ</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.revealBox, { opacity: fadeIn, transform: [{ scale }] }]}>
          <Text style={styles.revealEmoji}>🕵️</Text>
          <Text style={styles.revealLabel}>ШПИОНЫ БЫЛИ:</Text>
          {impostors.map((imp) => (
            <Text key={imp.playerId} style={styles.impostorName}>{imp.playerName}</Text>
          ))}
          <View style={styles.divider} />
          <Text style={styles.wordLabel}>// СЕКРЕТНОЕ СЛОВО //</Text>
          <Text style={styles.wordText}>{word}</Text>
          <Text style={styles.catText}>{category}</Text>
        </Animated.View>

        <Text style={styles.allTitle}>// ВСЕ РОЛИ //</Text>
        {roundRoles.map((role) => (
          <View key={role.playerId} style={[styles.playerRow, { borderColor: role.isImpostor ? "rgba(255,0,85,0.35)" : BORDER }]}>
            <View style={[styles.avatar, { backgroundColor: role.isImpostor ? "rgba(255,0,85,0.1)" : CARD, borderColor: role.isImpostor ? "rgba(255,0,85,0.4)" : BORDER }]}>
              <Text style={styles.avatarEmoji}>{role.isImpostor ? "🕵️" : "🤖"}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{role.playerName}</Text>
              <Text style={[styles.playerRole, role.isImpostor && { color: RED }]}>
                {role.isImpostor ? "ШПИОН" : `СЛОВО: ${role.word}`}
              </Text>
            </View>
            {role.isImpostor && (
              <View style={styles.spyTag}>
                <Text style={styles.spyTagText}>SPY</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.buttonsWrap}>
          <Pressable style={({ pressed }) => [styles.playAgainBtn, pressed && { opacity: 0.8 }]} onPress={() => { resetGame(); router.replace("/setup"); }}>
            <Feather name="refresh-cw" size={18} color="#000" />
            <Text style={styles.playAgainText}>ИГРАТЬ СНОВА</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.8 }]} onPress={() => { resetGame(); router.replace("/home"); }}>
            <Feather name="home" size={18} color={CYAN} />
            <Text style={styles.homeText}>НА ГЛАВНУЮ</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { padding: 6, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  headerTitle: { color: CYAN, fontSize: 16, fontWeight: "900", letterSpacing: 4,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, paddingTop: 16 },
  revealBox: {
    backgroundColor: "rgba(255,0,85,0.05)", borderRadius: 4, padding: 24,
    alignItems: "center", borderWidth: 1.5, borderColor: "rgba(255,0,85,0.35)", gap: 8, marginBottom: 8,
  },
  revealEmoji: { fontSize: 52, marginBottom: 4 },
  revealLabel: { color: "rgba(255,0,85,0.6)", fontSize: 11, letterSpacing: 3, fontWeight: "700" },
  impostorName: { color: RED, fontSize: 28, fontWeight: "900", textAlign: "center",
    textShadowColor: RED, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 },
  divider: { width: "80%", height: 1, backgroundColor: BORDER, marginVertical: 4 },
  wordLabel: { color: "rgba(0,255,255,0.4)", fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  wordText: { color: CYAN, fontSize: 34, fontWeight: "900", textAlign: "center",
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  catText: { color: "rgba(0,255,255,0.4)", fontSize: 13, letterSpacing: 1 },
  allTitle: { color: MAGENTA, fontSize: 11, letterSpacing: 3, fontWeight: "700", paddingHorizontal: 4 },
  playerRow: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 4, padding: 12, gap: 12, borderWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  avatarEmoji: { fontSize: 20 },
  playerInfo: { flex: 1 },
  playerName: { color: "rgba(224,224,255,0.9)", fontSize: 15, fontWeight: "700" },
  playerRole: { color: "rgba(0,255,255,0.45)", fontSize: 12, marginTop: 2, letterSpacing: 1 },
  spyTag: {
    backgroundColor: "rgba(255,0,85,0.1)", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: "rgba(255,0,85,0.4)",
  },
  spyTagText: { color: RED, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  buttonsWrap: { gap: 10, marginTop: 8 },
  playAgainBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: CYAN, borderRadius: 4, paddingVertical: 16,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16, elevation: 8,
  },
  playAgainText: { color: "#000", fontSize: 14, fontWeight: "900", letterSpacing: 3 },
  homeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 4, paddingVertical: 16, borderWidth: 1.5, borderColor: BORDER,
  },
  homeText: { color: CYAN, fontSize: 14, fontWeight: "700", letterSpacing: 2 },
});
