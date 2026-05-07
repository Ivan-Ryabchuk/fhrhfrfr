import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { playRevealSound } from "@/hooks/useSound";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";
import { useGame } from "@/contexts/GameContext";

const CYAN = "#00FFFF";
const RED = "#FF0055";
const MAGENTA = "#FF00FF";
const GREEN = "#00FF41";
const BG = "#050510";
const BORDER = "rgba(0,255,255,0.18)";

export default function RevealScreen() {
  const insets = useSafeAreaInsets();
  const { settings, roundRoles, currentRevealIndex, setCurrentRevealIndex, setGamePhase } = useGame();
  const [revealed, setRevealed] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  const role = roundRoles[currentRevealIndex] as any;
  if (!role) return null;

  function handleReveal() {
    if (revealed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed(true);
    playRevealSound();
    const isImpostor = (roundRoles[currentRevealIndex] as any)?.isImpostor;
    if (isImpostor) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  function resetCard() {
    setRevealed(false);
  }

  function handleNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentRevealIndex < roundRoles.length - 1) {
      setCurrentRevealIndex(currentRevealIndex + 1);
      resetCard();
    } else {
      if (settings.gameMode === "questions") {
        setGamePhase("questions");
        router.replace("/questions");
      } else {
        setGamePhase("playing");
        router.replace("/game");
      }
    }
  }

  const isLast = currentRevealIndex === roundRoles.length - 1;
  const progress = ((currentRevealIndex + 1) / roundRoles.length) * 100;

  const otherSpies: string[] = role.isImpostor && settings.impostorsKnowEachOther
    ? (role.impostorNames ?? []).filter((n: string) => n !== role.playerName)
    : [];

  const showHint = role.isImpostor && settings.showHintToImpostor;

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CyberBg />
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color="rgba(0,255,255,0.5)" />
        </Pressable>
        <Text style={styles.progress}>{currentRevealIndex + 1} / {roundRoles.length}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
      </View>

      <Text style={styles.passTip}>▶ ПЕРЕДАЙ УСТРОЙСТВО АГЕНТУ:</Text>
      <Text style={styles.playerName}>{role.playerName}</Text>

      <View style={styles.cardArea}>
        {!revealed ? (
          <Pressable style={[styles.card, styles.cardFront, styles.cardTouchable]} onPress={handleReveal}>
            <Text style={styles.cardLockIcon}>🔒</Text>
            <Text style={styles.cardFrontTitle}>НАЖМИ ДЛЯ{"\n"}ПОЛУЧЕНИЯ РОЛИ</Text>
            <Text style={styles.cardFrontSub}>Остальные агенты не должны видеть</Text>
          </Pressable>
        ) : (
        <Pressable
          style={styles.cardTouchable}
          onPress={handleNext}
        >
          <View
            style={[
              styles.card,
              role.isImpostor ? styles.cardImpostor : styles.cardPlayer,
            ]}
          >
              {role.isImpostor ? (
              <>
                <Text style={styles.spyEmoji}>🕵️</Text>
                <Text style={styles.roleLabelImpostor}>⚠ ТЫ ШПИОН ⚠</Text>
                <Text style={styles.roleSub}>
                  {role.word !== "???"
                    ? `Категория: ${role.word}`
                    : "Ты ничего не знаешь!\nПытайся вписаться в команду"}
                </Text>

                {showHint && role.hintWord && (
                  <View style={styles.hintBox}>
                    <Text style={styles.hintIcon}>💡</Text>
                    <Text style={styles.hintLabel}>ТВОЯ ПОДСКАЗКА</Text>
                    <Text style={styles.hintWord}>{role.hintWord}</Text>
                    <Text style={styles.hintSub}>Используй в первом раунде, чтобы влиться!</Text>
                  </View>
                )}

                {otherSpies.length > 0 && (
                  <View style={styles.alliesBox}>
                    <Text style={styles.alliesLabel}>🤝 ТВОИ СОЮЗНИКИ:</Text>
                    {otherSpies.map((name: string) => (
                      <Text key={name} style={styles.allyName}>{name}</Text>
                    ))}
                  </View>
                )}

                <Text style={styles.impostorHint}>// Угадай слово и победи //</Text>
              </>
            ) : settings.gameMode === "questions" ? (
              <>
                <Text style={styles.agentEmoji}>🤖</Text>
                <Text style={styles.roleLabel}>РЕЖИМ ВОПРОСОВ</Text>
                <Text style={styles.wordText}>АГЕНТ</Text>
                <Text style={styles.catLabel}>// {role.category} //</Text>
                <Text style={[styles.impostorHint, { color: "rgba(0,255,255,0.45)" }]}>
                  {"// Ответь на свой вопрос честно //"}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.agentEmoji}>🤖</Text>
                <Text style={styles.roleLabel}>ТВОЁ СЛОВО:</Text>
                <Text style={styles.wordText}>{role.word}</Text>
                <Text style={styles.catLabel}>// {role.category} //</Text>
              </>
            )}
            <Text style={[styles.nextBtnText, { marginTop: 12, fontSize: 11 }]}>
              {isLast ? "[ НАЖМИ ДЛЯ ОБСУЖДЕНИЯ ]" : "[ НАЖМИ ДЛЯ СЛЕДУЮЩЕГО ]"}
            </Text>
          </View>
        </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, alignItems: "center" },
  header: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  closeBtn: { padding: 6, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  progress: { color: "rgba(0,255,255,0.5)", fontSize: 13, fontWeight: "700", letterSpacing: 2 },
  progressBar: { width: "90%", height: 2, backgroundColor: "rgba(0,255,255,0.1)", marginBottom: 28, overflow: "hidden" },
  progressFill: {
    height: 2, backgroundColor: CYAN,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
  },
  passTip: { color: "rgba(0,255,255,0.45)", fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  playerName: {
    color: CYAN, fontSize: 26, fontWeight: "900", marginBottom: 28, letterSpacing: 2,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
  },
  cardArea: { width: "88%", height: 320, marginBottom: 24 },
  cardTouchable: { flex: 1 },
  card: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 16, gap: 10, borderRadius: 4,
  },
  cardFront: { backgroundColor: "rgba(0,255,255,0.04)", borderWidth: 1.5, borderColor: BORDER },
  cardPlayer: { backgroundColor: "rgba(0,255,255,0.08)", borderWidth: 2, borderColor: CYAN },
  cardImpostor: { backgroundColor: "rgba(255,0,85,0.08)", borderWidth: 2, borderColor: RED },
  cardLockIcon: { fontSize: 48 },
  cardFrontTitle: {
    color: CYAN, fontSize: 20, fontWeight: "900", textAlign: "center", letterSpacing: 2,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  cardFrontSub: { color: "rgba(0,255,255,0.35)", fontSize: 12, textAlign: "center", letterSpacing: 1 },
  spyEmoji: { fontSize: 44 },
  agentEmoji: { fontSize: 44 },
  roleLabelImpostor: {
    color: RED, fontSize: 18, fontWeight: "900", letterSpacing: 2, textAlign: "center",
    textShadowColor: RED, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
  },
  roleLabel: { color: "rgba(0,255,255,0.6)", fontSize: 14, fontWeight: "700", letterSpacing: 2 },
  roleSub: { color: "rgba(255,0,85,0.7)", fontSize: 13, textAlign: "center", lineHeight: 18 },
  wordText: {
    color: CYAN, fontSize: 36, fontWeight: "900", textAlign: "center",
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  catLabel: { color: "rgba(0,255,255,0.45)", fontSize: 12, letterSpacing: 2 },
  impostorHint: { color: "rgba(255,0,85,0.45)", fontSize: 10, letterSpacing: 1 },
  hintBox: {
    backgroundColor: "rgba(255,0,255,0.08)", borderRadius: 4, borderWidth: 1,
    borderColor: "rgba(255,0,255,0.3)", padding: 8, alignItems: "center", gap: 4, width: "100%",
  },
  hintIcon: { fontSize: 20 },
  hintLabel: { color: MAGENTA, fontSize: 11, fontWeight: "800", letterSpacing: 2, textAlign: "center" },
  hintWord: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center", letterSpacing: 1 },
  hintSub: { color: "rgba(255,0,255,0.5)", fontSize: 10, textAlign: "center", letterSpacing: 1 },
  alliesBox: {
    backgroundColor: "rgba(0,255,65,0.06)", borderRadius: 4, borderWidth: 1,
    borderColor: "rgba(0,255,65,0.3)", padding: 8, alignItems: "center", gap: 4, width: "100%",
  },
  alliesLabel: { color: GREEN, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  allyName: { color: GREEN, fontSize: 15, fontWeight: "700" },
  nextBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: CYAN, borderRadius: 4, paddingVertical: 16, paddingHorizontal: 28, width: "88%",
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 10,
  },
  nextBtnText: { color: "#000", fontSize: 14, fontWeight: "900", letterSpacing: 2 },
});
