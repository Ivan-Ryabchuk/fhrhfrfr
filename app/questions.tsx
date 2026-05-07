import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";
import { useGame } from "@/contexts/GameContext";

const CYAN = "#00FFFF";
const RED = "#FF0055";
const MAGENTA = "#FF00FF";
const BG = "#050510";
const BORDER = "rgba(0,255,255,0.18)";

type Step = "pass" | "role" | "question";

export default function QuestionsScreen() {
  const insets = useSafeAreaInsets();
  const {
    settings,
    roundRoles,
    currentQuestionPair,
    playerAnswers,
    setPlayerAnswers,
    currentAnswerIndex,
    setCurrentAnswerIndex,
    setGamePhase,
    resetGame,
  } = useGame();

  const [step, setStep] = useState<Step>("pass");
  const [answer, setAnswer] = useState("");
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  const role = roundRoles[currentAnswerIndex];
  if (!role || !currentQuestionPair) return null;

  const question = role.isImpostor ? currentQuestionPair.similar : currentQuestionPair.main;
  const totalPlayers = roundRoles.length;
  const isLast = currentAnswerIndex === totalPlayers - 1;
  const progress = ((currentAnswerIndex + 1) / totalPlayers) * 100;

  const otherSpies: string[] =
    role.isImpostor && settings.impostorsKnowEachOther
      ? (role.impostorNames ?? []).filter((n) => n !== role.playerName)
      : [];

  function fadeTransition(callback: () => void) {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(callback, 150);
  }

  function handlePassTap() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fadeTransition(() => setStep("role"));
  }

  function handleRoleTap() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fadeTransition(() => setStep("question"));
  }

  function handleSubmit() {
    if (!answer.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newAnswer = {
      playerId: role.playerId,
      playerName: role.playerName,
      question,
      answer: answer.trim(),
    };
    const updatedAnswers = [...playerAnswers, newAnswer];
    setPlayerAnswers(updatedAnswers);
    setAnswer("");

    if (isLast) {
      setGamePhase("playing");
      router.replace("/game");
    } else {
      fadeTransition(() => {
        setCurrentAnswerIndex(currentAnswerIndex + 1);
        setStep("pass");
      });
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
        <CyberBg />

        <View style={styles.header}>
          <Pressable
            style={styles.closeBtn}
            onPress={() => { resetGame(); router.replace("/setup"); }}
          >
            <Feather name="x" size={18} color="rgba(0,255,255,0.5)" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === "pass" ? "ПЕРЕДАЧА" : step === "role" ? "РОЛЬ" : `ВОПРОС ДЛЯ ${role.playerName.toUpperCase()}`}
          </Text>
          <Text style={styles.headerProgress}>{currentAnswerIndex + 1}/{totalPlayers}</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>

        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

          {step === "pass" && (
            <Pressable style={styles.passScreen} onPress={handlePassTap}>
              <View style={styles.passInner}>
                <Text style={styles.passEmoji}>🔒</Text>
                <Text style={styles.passTitle}>ПЕРЕДАЙ УСТРОЙСТВО</Text>
                <View style={styles.passNameBox}>
                  <Text style={styles.passName}>{role.playerName}</Text>
                </View>
                <Text style={styles.passSub}>Остальные не должны видеть экран</Text>
                <View style={styles.passTapHint}>
                  <Text style={styles.passTapText}>[ НАЖМИ ЧТОБЫ ОТКРЫТЬ ]</Text>
                </View>
              </View>
            </Pressable>
          )}

          {step === "role" && (
            <Pressable style={styles.roleScreen} onPress={handleRoleTap}>
              {role.isImpostor ? (
                <View style={styles.roleInner}>
                  <Text style={styles.spyEmoji}>🕵️</Text>
                  <Text style={styles.roleLabelSpy}>⚠ ТЫ ШПИОН ⚠</Text>
                  <Text style={styles.roleSubSpy}>
                    {settings.showCategoryToImpostor
                      ? `Категория: ${role.category}`
                      : "Ты ничего не знаешь!\nПытайся вписаться в команду"}
                  </Text>
                  {otherSpies.length > 0 && (
                    <View style={styles.alliesBox}>
                      <Text style={styles.alliesLabel}>🤝 ТВОИ СОЮЗНИКИ:</Text>
                      {otherSpies.map((name) => (
                        <Text key={name} style={styles.allyName}>{name}</Text>
                      ))}
                    </View>
                  )}
                  <View style={styles.roleTapHint}>
                    <Text style={styles.roleTapText}>[ НАЖМИ — ПОЛУЧИТЬ ВОПРОС ]</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.roleInner}>
                  <Text style={styles.agentEmoji}>🤖</Text>
                  <Text style={styles.roleLabelAgent}>АГЕНТ</Text>
                  <Text style={styles.roleSubAgent}>// {role.category} //</Text>
                  <View style={styles.roleTapHint}>
                    <Text style={[styles.roleTapText, { color: CYAN }]}>
                      [ НАЖМИ — ПОЛУЧИТЬ ВОПРОС ]
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          )}

          {step === "question" && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.questionContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.qPlayerName}>{role.playerName}</Text>
              <View style={styles.qCategoryBadge}>
                <Text style={styles.qCategoryText}>Категория: {currentQuestionPair.category}</Text>
              </View>

              <View style={[
                styles.qQuestionCard,
                role.isImpostor && styles.qQuestionCardSpy,
              ]}>
                <Text style={styles.qQuestionText}>{question}</Text>
              </View>

              {role.isImpostor && (
                <View style={styles.qSpyHint}>
                  <Text style={styles.qSpyHintIcon}>🕵️</Text>
                  <Text style={styles.qSpyHintText}>Ты шпион — отвечай так, чтобы не палиться!</Text>
                </View>
              )}

              <View style={styles.qInputCard}>
                <TextInput
                  ref={inputRef}
                  style={styles.qInput}
                  placeholder="Введите ваш ответ здесь..."
                  placeholderTextColor="rgba(0,255,255,0.2)"
                  value={answer}
                  onChangeText={setAnswer}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  blurOnSubmit
                  autoFocus={Platform.OS !== "web"}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.qSubmitBtn,
                  !answer.trim() && styles.qSubmitBtnDisabled,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleSubmit}
                disabled={!answer.trim()}
              >
                <Text style={[styles.qSubmitText, !answer.trim() && styles.qSubmitTextDisabled]}>
                  {isLast ? "Завершить" : "Отправить ответ"}
                </Text>
              </Pressable>

              <Text style={styles.qProgress}>
                {currentAnswerIndex} / {totalPlayers} ответов отправлено
              </Text>
            </ScrollView>
          )}

        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  closeBtn: { padding: 6, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  headerTitle: {
    color: CYAN, fontSize: 12, fontWeight: "900", letterSpacing: 2, flex: 1,
    textAlign: "center", marginHorizontal: 8,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
  },
  headerProgress: { color: "rgba(0,255,255,0.5)", fontSize: 13, fontWeight: "700", letterSpacing: 2 },
  progressBar: { width: "100%", height: 2, backgroundColor: "rgba(0,255,255,0.08)" },
  progressFill: {
    height: 2, backgroundColor: MAGENTA,
    shadowColor: MAGENTA, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
  },

  passScreen: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },
  passInner: { alignItems: "center", gap: 20, paddingHorizontal: 32 },
  passEmoji: { fontSize: 64 },
  passTitle: {
    color: "rgba(0,255,255,0.6)", fontSize: 13, fontWeight: "900", letterSpacing: 3,
    textAlign: "center",
  },
  passNameBox: {
    borderWidth: 2, borderColor: CYAN, borderRadius: 8,
    paddingHorizontal: 32, paddingVertical: 14,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20,
  },
  passName: {
    color: CYAN, fontSize: 34, fontWeight: "900", letterSpacing: 2,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
  },
  passSub: { color: "rgba(0,255,255,0.3)", fontSize: 12, textAlign: "center", letterSpacing: 1 },
  passTapHint: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1, borderColor: "rgba(0,255,255,0.3)", borderRadius: 4,
  },
  passTapText: { color: "rgba(0,255,255,0.5)", fontSize: 11, fontWeight: "700", letterSpacing: 2 },

  roleScreen: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },
  roleInner: { alignItems: "center", gap: 16, paddingHorizontal: 32, width: "100%" },
  spyEmoji: { fontSize: 60 },
  agentEmoji: { fontSize: 60 },
  roleLabelSpy: {
    color: RED, fontSize: 22, fontWeight: "900", letterSpacing: 3, textAlign: "center",
    textShadowColor: RED, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
  },
  roleLabelAgent: {
    color: CYAN, fontSize: 36, fontWeight: "900", letterSpacing: 4,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  roleSubSpy: { color: "rgba(255,0,85,0.7)", fontSize: 14, textAlign: "center", lineHeight: 22 },
  roleSubAgent: { color: "rgba(0,255,255,0.5)", fontSize: 13, letterSpacing: 2 },
  alliesBox: {
    backgroundColor: "rgba(0,255,65,0.06)", borderRadius: 6, borderWidth: 1,
    borderColor: "rgba(0,255,65,0.3)", padding: 12, alignItems: "center", gap: 6, width: "100%",
  },
  alliesLabel: { color: "#00FF41", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  allyName: { color: "#00FF41", fontSize: 15, fontWeight: "700" },
  roleTapHint: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1, borderColor: "rgba(255,0,85,0.3)", borderRadius: 4,
  },
  roleTapText: { color: "rgba(255,0,85,0.6)", fontSize: 11, fontWeight: "700", letterSpacing: 2 },

  questionContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, alignItems: "center", gap: 14 },
  qPlayerName: {
    color: MAGENTA, fontSize: 26, fontWeight: "900", letterSpacing: 2,
    textShadowColor: MAGENTA, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  qCategoryBadge: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 4,
    backgroundColor: "rgba(255,0,255,0.06)", borderWidth: 1, borderColor: "rgba(255,0,255,0.2)",
  },
  qCategoryText: { color: "rgba(255,0,255,0.7)", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  qQuestionCard: {
    width: "100%", backgroundColor: "rgba(255,0,255,0.05)", borderRadius: 4,
    borderWidth: 1.5, borderColor: "rgba(255,0,255,0.35)", padding: 22,
    shadowColor: MAGENTA, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  qQuestionCardSpy: {
    borderColor: "rgba(255,0,85,0.4)", backgroundColor: "rgba(255,0,85,0.05)",
    shadowColor: RED,
  },
  qQuestionText: {
    color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center", lineHeight: 30,
  },
  qSpyHint: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,0,85,0.08)", borderRadius: 4, borderWidth: 1,
    borderColor: "rgba(255,0,85,0.3)", paddingHorizontal: 14, paddingVertical: 10, width: "100%",
  },
  qSpyHintIcon: { fontSize: 18 },
  qSpyHintText: { color: "rgba(255,0,85,0.8)", fontSize: 12, fontWeight: "700", flex: 1 },
  qInputCard: {
    width: "100%", backgroundColor: "rgba(0,255,255,0.03)", borderRadius: 4,
    borderWidth: 1, borderColor: "rgba(0,255,255,0.15)", padding: 4,
  },
  qInput: {
    color: "rgba(224,224,255,0.9)", fontSize: 15, padding: 14,
    minHeight: 90, textAlignVertical: "top",
  },
  qSubmitBtn: {
    width: "100%", backgroundColor: CYAN, borderRadius: 4,
    paddingVertical: 16, alignItems: "center", justifyContent: "center",
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16, elevation: 8,
  },
  qSubmitBtnDisabled: {
    backgroundColor: "rgba(0,255,255,0.08)", shadowOpacity: 0,
    borderWidth: 1, borderColor: "rgba(0,255,255,0.18)",
  },
  qSubmitText: { color: "#000", fontSize: 15, fontWeight: "900", letterSpacing: 2 },
  qSubmitTextDisabled: { color: "rgba(0,255,255,0.3)" },
  qProgress: { color: "rgba(0,255,255,0.25)", fontSize: 12, letterSpacing: 1 },
});
