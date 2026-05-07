import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";
import { useGame } from "@/contexts/GameContext";
import { playSuccessSound } from "@/hooks/useSound";

const CYAN = "#00FFFF";
const RED = "#FF0055";
const BG = "#050510";
const BORDER = "rgba(0,255,255,0.18)";

export default function VotingScreen() {
  const insets = useSafeAreaInsets();
  const { roundRoles, setRoundRoles } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  function handleVote() {
    if (!selectedId) return;
    playSuccessSound();

    const votedOut = roundRoles.find((r) => r.playerId === selectedId);
    if (!votedOut) return;

    const remaining = roundRoles.filter((r) => r.playerId !== selectedId);
    const impostorsLeft = remaining.filter((r) => r.isImpostor).length;
    const civiliansLeft = remaining.filter((r) => !r.isImpostor).length;

    setRoundRoles(remaining);

    if (impostorsLeft === 0) {
      router.replace(("/voting-result?outcome=civilians_won&wasImpostor=" + votedOut.isImpostor) as any);
    } else if (impostorsLeft >= civiliansLeft) {
      router.replace(("/voting-result?outcome=impostors_won&wasImpostor=" + votedOut.isImpostor) as any);
    } else {
      router.replace(("/voting-result?outcome=continue&wasImpostor=" + votedOut.isImpostor) as any);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CyberBg />

      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color="rgba(0,255,255,0.5)" />
        </Pressable>
        <Text style={styles.headerTitle}>🗳️ ГОЛОСОВАНИЕ</Text>
        <View style={{ width: 32 }} />
      </View>

      <Text style={styles.instruction}>Выберите, кого исключить</Text>

      <ScrollView contentContainerStyle={styles.playersList} showsVerticalScrollIndicator={false}>
        {roundRoles.map((role) => (
          <Pressable
            key={role.playerId}
            style={({ pressed }) => [
              styles.playerCard,
              selectedId === role.playerId && styles.playerCardSelected,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => setSelectedId(role.playerId)}
          >
            <View style={styles.playerCheck}>
              {selectedId === role.playerId ? (
                <View style={styles.checkmark}>
                  <Feather name="check" size={14} color="#000" />
                </View>
              ) : (
                <View style={styles.checkEmpty} />
              )}
            </View>
            <Text style={styles.playerName}>{role.playerName}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.voteBtn,
          !selectedId && styles.voteBtnDisabled,
          pressed && { opacity: !selectedId ? 0.5 : 0.85 },
        ]}
        onPress={handleVote}
        disabled={!selectedId}
      >
        <Feather name="check-circle" size={20} color="#000" />
        <Text style={styles.voteBtnText}>ИСКЛЮЧИТЬ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  closeBtn: { padding: 6, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  headerTitle: { color: CYAN, fontSize: 16, fontWeight: "900", letterSpacing: 4,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  instruction: { color: "rgba(0,255,255,0.45)", fontSize: 13, textAlign: "center", paddingHorizontal: 20, paddingVertical: 16, letterSpacing: 1 },
  playersList: { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  playerCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "rgba(0,255,255,0.03)", borderRadius: 4, padding: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  playerCardSelected: { borderColor: CYAN, backgroundColor: "rgba(0,255,255,0.1)" },
  playerCheck: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  checkmark: { width: 22, height: 22, borderRadius: 11, backgroundColor: CYAN, alignItems: "center", justifyContent: "center" },
  checkEmpty: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: "rgba(0,255,255,0.3)" },
  playerName: { flex: 1, color: "#e0e0ff", fontSize: 15, fontWeight: "600" },
  voteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: CYAN, borderRadius: 4, paddingVertical: 16, marginHorizontal: 16,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16, elevation: 8,
  },
  voteBtnDisabled: { opacity: 0.4 },
  voteBtnText: { color: "#000", fontSize: 16, fontWeight: "900", letterSpacing: 2 },
});
