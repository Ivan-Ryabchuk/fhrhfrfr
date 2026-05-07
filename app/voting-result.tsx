import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";
import { useGame } from "@/contexts/GameContext";

const CYAN = "#00FFFF";
const RED = "#FF0055";
const GREEN = "#00FF41";
const BG = "#050510";
const BORDER = "rgba(0,255,255,0.18)";

export default function VotingResultScreen() {
  const insets = useSafeAreaInsets();
  const { outcome, wasImpostor } = useLocalSearchParams();
  const { roundRoles, resetGame, setCurrentRevealIndex, setGamePhase } = useGame();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  const isWasImpostorStr = wasImpostor === "true";
  const outcomeStr = String(outcome);

  let title = "РЕЗУЛЬТАТ РАУНДА";
  let emoji = "🎭";
  let message = "";
  let btnText = "НАЧАТЬ НОВЫЙ РАУНД";
  let titleColor = CYAN;

  if (outcomeStr === "civilians_won") {
    title = "МИРНЫЕ ПОБЕДИЛИ! 🎉";
    emoji = "🎉";
    message = "Все шпионы исключены!";
    titleColor = GREEN;
  } else if (outcomeStr === "impostors_won") {
    title = "ШПИОНЫ ПОБЕДИЛИ! 💀";
    emoji = "💀";
    message = "Шпионов осталось столько же, сколько мирных...";
    titleColor = RED;
  } else if (outcomeStr === "continue") {
    title = isWasImpostorStr ? "ШПИОН ИСКЛЮЧЕН! ✨" : "МИРНЫЙ ИСКЛЮЧЕН ☠️";
    emoji = isWasImpostorStr ? "✨" : "☠️";
    message = isWasImpostorStr ? "Игра продолжается!" : "Игра продолжается!";
    titleColor = isWasImpostorStr ? GREEN : RED;
    btnText = roundRoles.length > 0 ? "СЛЕДУЮЩИЙ РАУНД" : "КОНЕЦ ИГРЫ";
  }

  function handleContinue() {
    if (outcomeStr === "continue" && roundRoles.length > 0) {
      setGamePhase("playing");
      router.replace("/game");
    } else {
      resetGame();
      router.replace("/setup");
    }
  }

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
      <CyberBg />

      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {roundRoles.length > 0 && outcomeStr === "continue" && (
          <Text style={styles.remaining}>
            Осталось игроков: <Text style={{ color: CYAN }}>{roundRoles.length}</Text>
          </Text>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
        onPress={handleContinue}
      >
        <Feather name="arrow-right" size={20} color="#000" />
        <Text style={styles.btnText}>{btnText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, justifyContent: "space-between" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 24 },
  emoji: { fontSize: 64 },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: 2, textAlign: "center",
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  message: { color: "rgba(224,224,255,0.65)", fontSize: 16, textAlign: "center", lineHeight: 24 },
  remaining: { color: "rgba(0,255,255,0.5)", fontSize: 14, letterSpacing: 1, marginTop: 8 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: CYAN, borderRadius: 4, paddingVertical: 16, marginHorizontal: 16,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16,
  },
  btnText: { color: "#000", fontSize: 16, fontWeight: "900", letterSpacing: 2 },
});
