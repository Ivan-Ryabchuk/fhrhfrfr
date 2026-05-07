import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { playAlarmSound, playTickSound } from "@/hooks/useSound";
import React, { useEffect, useRef, useState } from "react";
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

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { settings, roundRoles, resetGame, setGamePhase, playerAnswers, currentQuestionPair } = useGame();
  const totalSecs = settings.timerMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [running, setRunning] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [confirmVote, setConfirmVote] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const timerRotate = useRef(new Animated.Value(0)).current;
  const urgentFlash = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  const isQuestionsMode = settings.gameMode === "questions";

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            playAlarmSound();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0 && running) {
      playTickSound();
      if (timeLeft <= 5) {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.14, duration: 150, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(timerRotate, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(timerRotate, { toValue: -1, duration: 100, useNativeDriver: true }),
            Animated.timing(timerRotate, { toValue: 0, duration: 100, useNativeDriver: true }),
          ]),
          Animated.timing(urgentFlash, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 200, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) setConfirmVote(true);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isUrgent = timeLeft <= 30;
  const timerColor = isUrgent ? RED : CYAN;

  function togglePause() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRunning((r) => !r);
  }

  function goVote() {
    setRunning(false);
    setConfirmVote(false);
    if (settings.enableVoting) {
      router.replace("/voting");
    } else {
      setGamePhase("result");
      router.replace("/result");
    }
  }

  const impostors = roundRoles.filter((r) => r.isImpostor);
  const word = roundRoles.find((r) => !r.isImpostor)?.word ?? "";
  const category = isQuestionsMode
    ? currentQuestionPair?.category ?? ""
    : roundRoles.find((r) => !r.isImpostor)?.category ?? "";

  function togglePlayerAnswer(playerName: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedPlayer((prev) => (prev === playerName ? null : playerName));
  }

  if (isQuestionsMode) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
        <CyberBg />

        {confirmVote && (
          <View style={styles.modal}>
            <View style={styles.modalBox}>
              <Text style={styles.modalEmoji}>🗳️</Text>
              <Text style={styles.modalTitle}>ГОЛОСОВАНИЕ</Text>
              <Text style={styles.modalDesc}>Кто шпион?{"\n"}Пора голосовать!</Text>
              <Pressable style={styles.modalBtnVote} onPress={goVote}>
                <Text style={styles.modalBtnVoteText}>ГОЛОСОВАТЬ</Text>
              </Pressable>
              <Pressable style={styles.modalBtnCancel} onPress={() => { setConfirmVote(false); setRunning(false); }}>
                <Text style={styles.modalBtnCancelText}>ЕЩЁ ОБСУДИМ</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => { resetGame(); router.replace("/setup"); }}>
            <Feather name="x" size={18} color="rgba(0,255,255,0.5)" />
          </Pressable>
          <Text style={styles.headerTitle}>ФАЗА ОБСУЖДЕНИЯ</Text>
          <Pressable style={styles.backBtn} onPress={() => { setRunning(false); setConfirmVote(true); }}>
            <Feather name="flag" size={18} color={CYAN} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.qContent}>

          {currentQuestionPair && (
            <View style={styles.qQuestionCard}>
              <Text style={styles.qQuestionText}>{currentQuestionPair.main}</Text>
            </View>
          )}

          <Text style={styles.qHint}>Нажми на игрока, чтобы увидеть его ответ</Text>

          {playerAnswers.map((ans, idx) => {
            const isExpanded = expandedPlayer === ans.playerName;
            return (
              <Pressable
                key={ans.playerId}
                style={[styles.qPlayerCard, isExpanded && styles.qPlayerCardExpanded]}
                onPress={() => togglePlayerAnswer(ans.playerName)}
              >
                <View style={styles.qPlayerRow}>
                  <View style={[styles.qPlayerNum, isExpanded && styles.qPlayerNumActive]}>
                    <Text style={[styles.qPlayerNumText, isExpanded && styles.qPlayerNumTextActive]}>
                      {idx + 1}
                    </Text>
                  </View>
                  <Text style={[styles.qPlayerName, isExpanded && styles.qPlayerNameActive]}>
                    {ans.playerName}
                  </Text>
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={isExpanded ? CYAN : "rgba(0,255,255,0.3)"}
                  />
                </View>
                {isExpanded && (
                  <View style={styles.qAnswerBox}>
                    <Text style={styles.qAnswerText}>{ans.answer}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}

          {revealed ? (
            <View style={styles.qRevealCard}>
              <Text style={styles.qRevealTitle}>ШПИОН(Ы)</Text>
              {impostors.map((imp) => (
                <Text key={imp.playerId} style={styles.qRevealName}>🕵️ {imp.playerName}</Text>
              ))}
              {currentQuestionPair && (
                <View style={styles.qSpyQuestion}>
                  <Text style={styles.qSpyQuestionLabel}>Вопрос шпиона был:</Text>
                  <Text style={styles.qSpyQuestionText}>"{currentQuestionPair.similar}"</Text>
                </View>
              )}
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.qVoteBtn, pressed && { opacity: 0.85 }]}
              onPress={() => { setRunning(false); setConfirmVote(true); }}
            >
              <Text style={styles.qVoteBtnText}>Найти самозванца</Text>
            </Pressable>
          )}

        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CyberBg />

      {confirmVote && (
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>🗳️</Text>
            <Text style={styles.modalTitle}>ГОЛОСОВАНИЕ</Text>
            <Text style={styles.modalDesc}>Время вышло! Кто шпион?{"\n"}Пора голосовать!</Text>
            <Pressable style={styles.modalBtnVote} onPress={goVote}>
              <Text style={styles.modalBtnVoteText}>ГОЛОСОВАТЬ</Text>
            </Pressable>
            <Pressable style={styles.modalBtnCancel} onPress={() => { setConfirmVote(false); setRunning(false); }}>
              <Text style={styles.modalBtnCancelText}>ЕЩЁ ОБСУДИМ</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => { resetGame(); router.replace("/setup"); }}>
          <Feather name="x" size={18} color="rgba(0,255,255,0.5)" />
        </Pressable>
        <Text style={styles.headerTitle}>ОБСУЖДЕНИЕ</Text>
        <Pressable style={styles.backBtn} onPress={() => { setRunning(false); setConfirmVote(true); }}>
          <Feather name="flag" size={18} color={CYAN} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.timerWrap, { transform: [{ scale: pulse }, { rotateZ: timerRotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-8deg", "0deg", "8deg"] }) }] }]}>
          <Animated.View style={[
            styles.timerRing, 
            { borderColor: timerColor, shadowColor: timerColor, backgroundColor: urgentFlash.interpolate({ inputRange: [0, 1], outputRange: ["rgba(0,255,255,0.03)", "rgba(255,0,85,0.15)"] }) },
          ]}>
            <Text style={[styles.timeText, { color: timerColor }]}>{timeStr}</Text>
            <Text style={styles.timeSub}>{running ? "ИДЁТ ВРЕМЯ" : "ПАУЗА"}</Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.controlRow}>
          <Pressable style={styles.pauseBtn} onPress={togglePause}>
            <Feather name={running ? "pause" : "play"} size={22} color={CYAN} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, pressed && { opacity: 0.85 }]}
            onPress={() => { setRunning(false); setConfirmVote(true); }}
          >
            <Feather name="check-circle" size={20} color="#000" />
            <Text style={styles.voteBtnText}>ГОЛОСОВАТЬ</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          {[
            { icon: "tag", label: "Категория", value: category || "—" },
            { icon: "users", label: "Игроков", value: `${roundRoles.length} чел.` },
            { icon: "alert-triangle", label: "Шпионов", value: String(impostors.length) },
          ].map((row, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.infoRow}>
                <Feather name={row.icon as any} size={14} color="rgba(0,255,255,0.35)" />
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {revealed ? (
          <View style={styles.revealCard}>
            <Text style={styles.revealTitle}>// СЕКРЕТНОЕ СЛОВО //</Text>
            <Text style={styles.revealWord}>{word}</Text>
            <View style={styles.impostorList}>
              {impostors.map((imp) => (
                <View key={imp.playerId} style={styles.impostorBadge}>
                  <Text style={styles.impostorBadgeText}>🕵️ {imp.playerName}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.revealBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setRevealed(true)}
          >
            <Feather name="eye" size={16} color="rgba(0,255,255,0.4)" />
            <Text style={styles.revealBtnText}>РАСКРЫТЬ ОТВЕТ</Text>
          </Pressable>
        )}

        <Text style={styles.rulesHint}>
          {"› По очереди давайте подсказки. Не выдайте себя!"}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  modal: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(5,5,16,0.92)", zIndex: 100,
    alignItems: "center", justifyContent: "center",
  },
  modalBox: {
    width: "82%", backgroundColor: "#080818", borderRadius: 4,
    borderWidth: 2, borderColor: CYAN, padding: 28, alignItems: "center", gap: 14,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 28, elevation: 20,
  },
  modalEmoji: { fontSize: 48 },
  modalTitle: {
    color: CYAN, fontSize: 22, fontWeight: "900", letterSpacing: 4,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  modalDesc: { color: "rgba(224,224,255,0.6)", fontSize: 14, textAlign: "center", lineHeight: 22 },
  modalBtnVote: {
    width: "100%", backgroundColor: CYAN, borderRadius: 4, paddingVertical: 16,
    alignItems: "center",
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16,
  },
  modalBtnVoteText: { color: "#000", fontSize: 16, fontWeight: "900", letterSpacing: 3 },
  modalBtnCancel: {
    width: "100%", paddingVertical: 12, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(0,255,255,0.2)", borderRadius: 4,
  },
  modalBtnCancelText: { color: "rgba(0,255,255,0.5)", fontSize: 13, fontWeight: "700", letterSpacing: 2 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { padding: 6, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  headerTitle: {
    color: CYAN, fontSize: 16, fontWeight: "900", letterSpacing: 4,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  content: { paddingHorizontal: 20, paddingBottom: 32, alignItems: "center", gap: 20, paddingTop: 16 },
  qContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16, gap: 12 },

  timerWrap: { alignItems: "center" },
  timerRing: {
    width: 190, height: 190, borderRadius: 95, alignItems: "center", justifyContent: "center",
    borderWidth: 3, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 28, elevation: 14,
    backgroundColor: "rgba(0,255,255,0.03)",
  },
  timeText: { fontSize: 54, fontWeight: "900", letterSpacing: 2 },
  timeSub: { color: "rgba(0,255,255,0.35)", fontSize: 10, letterSpacing: 3, marginTop: 4 },
  controlRow: { flexDirection: "row", gap: 12, width: "100%" },
  pauseBtn: {
    width: 54, height: 54, borderRadius: 4, backgroundColor: CARD,
    borderWidth: 1.5, borderColor: BORDER, alignItems: "center", justifyContent: "center",
  },
  voteBtn: {
    flex: 1, flexDirection: "row", gap: 8, backgroundColor: CYAN, borderRadius: 4,
    alignItems: "center", justifyContent: "center",
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 8,
  },
  voteBtnText: { color: "#000", fontSize: 15, fontWeight: "900", letterSpacing: 2 },
  infoCard: {
    width: "100%", backgroundColor: CARD, borderRadius: 4, padding: 14,
    borderWidth: 1, borderColor: BORDER, gap: 10,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoLabel: { flex: 1, color: "rgba(0,255,255,0.45)", fontSize: 13 },
  infoValue: { color: "rgba(224,224,255,0.9)", fontSize: 14, fontWeight: "700" },
  divider: { height: 1, backgroundColor: BORDER },

  qQuestionCard: {
    backgroundColor: "rgba(255,0,255,0.05)", borderRadius: 12,
    borderWidth: 1.5, borderColor: "rgba(255,0,255,0.3)", padding: 20,
  },
  qQuestionText: {
    color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center", lineHeight: 30,
  },
  qHint: {
    color: "rgba(0,255,255,0.3)", fontSize: 11, textAlign: "center", letterSpacing: 1,
  },
  qPlayerCard: {
    backgroundColor: "rgba(0,255,255,0.03)", borderRadius: 12,
    borderWidth: 1, borderColor: BORDER, overflow: "hidden",
  },
  qPlayerCardExpanded: {
    borderColor: "rgba(0,255,255,0.4)",
    backgroundColor: "rgba(0,255,255,0.06)",
  },
  qPlayerRow: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 16,
  },
  qPlayerNum: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1.5,
    borderColor: "rgba(0,255,255,0.3)", alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,255,255,0.05)",
  },
  qPlayerNumActive: {
    borderColor: CYAN, backgroundColor: "rgba(0,255,255,0.15)",
  },
  qPlayerNumText: {
    color: "rgba(0,255,255,0.5)", fontSize: 14, fontWeight: "900",
  },
  qPlayerNumTextActive: { color: CYAN },
  qPlayerName: {
    flex: 1, color: "rgba(224,224,255,0.7)", fontSize: 16, fontWeight: "600",
  },
  qPlayerNameActive: { color: CYAN, fontWeight: "800" },
  qAnswerBox: {
    paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4,
    borderTopWidth: 1, borderTopColor: "rgba(0,255,255,0.12)",
  },
  qAnswerText: {
    color: "rgba(224,224,255,0.85)", fontSize: 15, lineHeight: 22, fontStyle: "italic",
  },
  qVoteBtn: {
    width: "100%", backgroundColor: RED, borderRadius: 12,
    paddingVertical: 18, alignItems: "center",
    shadowColor: RED, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 8,
  },
  qVoteBtnText: { color: "#fff", fontSize: 17, fontWeight: "900", letterSpacing: 1 },
  qRevealCard: {
    width: "100%", backgroundColor: "rgba(255,0,85,0.06)", borderRadius: 12,
    borderWidth: 1.5, borderColor: "rgba(255,0,85,0.4)", padding: 20, gap: 10, alignItems: "center",
  },
  qRevealTitle: { color: RED, fontSize: 12, fontWeight: "900", letterSpacing: 3 },
  qRevealName: { color: "#fff", fontSize: 22, fontWeight: "900" },
  qSpyQuestion: {
    width: "100%", backgroundColor: "rgba(255,0,85,0.08)", borderRadius: 8, padding: 12, gap: 4,
    borderWidth: 1, borderColor: "rgba(255,0,85,0.3)",
  },
  qSpyQuestionLabel: { color: "rgba(255,0,85,0.6)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  qSpyQuestionText: { color: RED, fontSize: 14, fontStyle: "italic", lineHeight: 20 },

  revealCard: {
    width: "100%", backgroundColor: "rgba(255,0,85,0.05)", borderRadius: 4, padding: 20,
    borderWidth: 1, borderColor: "rgba(255,0,85,0.35)", alignItems: "center", gap: 12,
  },
  revealTitle: { color: "rgba(255,0,85,0.6)", fontSize: 11, letterSpacing: 3, fontWeight: "700" },
  revealWord: {
    color: CYAN, fontSize: 34, fontWeight: "900",
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  impostorList: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  impostorBadge: {
    backgroundColor: "rgba(255,0,85,0.1)", borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: "rgba(255,0,85,0.35)",
  },
  impostorBadgeText: { color: RED, fontSize: 13, fontWeight: "700" },
  revealBtn: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 4, borderWidth: 1, borderColor: BORDER,
  },
  revealBtnText: { color: "rgba(0,255,255,0.4)", fontSize: 12, letterSpacing: 2 },
  rulesHint: {
    color: "rgba(0,255,255,0.2)", fontSize: 12, textAlign: "center",
    paddingHorizontal: 24, lineHeight: 20, letterSpacing: 1,
  },
});
