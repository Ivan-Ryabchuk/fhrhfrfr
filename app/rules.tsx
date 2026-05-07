import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";

const CYAN = "#00FFFF";
const MAGENTA = "#FF00FF";
const RED = "#FF0055";
const GREEN = "#00FF41";
const BG = "#050510";
const CARD = "rgba(0,255,255,0.04)";
const BORDER = "rgba(0,255,255,0.18)";

const STEPS = [
  { emoji: "⚙️", color: CYAN, title: "01. НАСТРОЙКА", desc: "Выбери игроков, категории и режим. Один или несколько станут тайными шпионами!" },
  { emoji: "👁️", color: MAGENTA, title: "02. ПОЛУЧИТЬ РОЛЬ", desc: "Каждый по очереди смотрит свою роль. Шпион видит только категорию — или ничего." },
  { emoji: "💬", color: GREEN, title: "03. ПОДСКАЗКИ", desc: "По очереди давайте слова-подсказки. Не выдайте слово, но и не будьте слишком расплывчатыми!" },
  { emoji: "🗳️", color: RED, title: "04. ГОЛОСОВАНИЕ", desc: "Обсудите и проголосуйте. Если ошибётесь — шпион побеждает!" },
];

export default function RulesScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 20 : insets.bottom + 20;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <CyberBg />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={CYAN} />
        </Pressable>
        <Text style={styles.headerTitle}>КАК ИГРАТЬ</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad }]} showsVerticalScrollIndicator={false}>
        {STEPS.map((step, i) => (
          <View key={i} style={[styles.stepCard, { borderColor: `${step.color}25` }]}>
            <View style={[styles.iconWrap, { backgroundColor: `${step.color}12`, borderColor: `${step.color}40` }]}>
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: step.color }]}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.tipCard, { borderColor: `${GREEN}25` }]}>
          <Text style={styles.tipEmoji}>⚡</Text>
          <Text style={[styles.tipTitle, { color: GREEN }]}>СОВЕТ ПРОФИ</Text>
          <Text style={styles.tipText}>
            Шпион должен внимательно слушать и вписываться. Давай подсказки, связанные с категорией, но не слишком очевидные.
            Настоящие игроки — не будьте слишком специфичными, чтобы не выдать слово сразу!
          </Text>
        </View>

        <View style={[styles.tipCard, { borderColor: `${RED}25` }]}>
          <Text style={styles.tipEmoji}>🏆</Text>
          <Text style={[styles.tipTitle, { color: RED }]}>КАК ПОБЕЖДАЕТ ШПИОН</Text>
          <Text style={styles.tipText}>
            Шпион побеждает, если команда ошибётся при голосовании. Также шпион может угадать секретное слово и победить!
          </Text>
        </View>

        <View style={[styles.exCard, { borderColor: `${MAGENTA}25` }]}>
          <Text style={[styles.tipTitle, { color: MAGENTA }]}>// ПРИМЕР //</Text>
          <Text style={styles.exWord}>Слово: <Text style={{ color: CYAN }}>Пицца</Text></Text>
          {[
            { name: "Маша:", hint: '"Итальянская"', ok: true },
            { name: "Вася (шпион):", hint: '"Вкусная" 🤔', ok: false },
            { name: "Петя:", hint: '"С сыром"', ok: true },
          ].map((r, i) => (
            <View key={i} style={styles.exRow}>
              <Text style={[styles.exName, !r.ok && { color: RED }]}>{r.name}</Text>
              <Text style={styles.exHint}>{r.hint}</Text>
            </View>
          ))}
          <Text style={styles.exFooter}>▲ Вася слишком расплывчат — возможно шпион!</Text>
        </View>

        <View style={[styles.tipCard, { borderColor: `${CYAN}25` }]}>
          <Text style={styles.tipEmoji}>❓</Text>
          <Text style={[styles.tipTitle, { color: CYAN }]}>РЕЖИМ ВОПРОСЫ</Text>
          <Text style={styles.tipText}>
            В этом режиме каждый задаёт один вопрос про неизвестный предмет или персонажа. Шпион старается угадать, что это, по вопросам, а остальные — найти шпиона, чьи вопросы отличаются от правды!
          </Text>
        </View>

        <View style={styles.authorBox}>
          <Text style={styles.authorText}>РАЗРАБОТЧИК: РЯБЧУК ИВАН АНДРЕЕВИЧ</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.8 }]} onPress={() => router.push("/setup")}>
          <Feather name="zap" size={18} color="#000" />
          <Text style={styles.startBtnText}>НАЧАТЬ ИГРУ</Text>
        </Pressable>
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
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  stepCard: { flexDirection: "row", backgroundColor: CARD, borderRadius: 4, padding: 14, gap: 12, borderWidth: 1, alignItems: "flex-start" },
  iconWrap: { width: 48, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  stepEmoji: { fontSize: 22 },
  stepText: { flex: 1, gap: 6 },
  stepTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  stepDesc: { color: "rgba(224,224,255,0.5)", fontSize: 13, lineHeight: 20 },
  tipCard: { backgroundColor: CARD, borderRadius: 4, padding: 16, borderWidth: 1, gap: 8, alignItems: "flex-start" },
  tipEmoji: { fontSize: 28 },
  tipTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  tipText: { color: "rgba(224,224,255,0.5)", fontSize: 13, lineHeight: 21 },
  exCard: { backgroundColor: CARD, borderRadius: 4, padding: 16, borderWidth: 1, gap: 8 },
  exWord: { color: "rgba(224,224,255,0.6)", fontSize: 14 },
  exRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  exName: { color: "rgba(0,255,255,0.5)", fontSize: 12, width: 120 },
  exHint: { color: "rgba(224,224,255,0.85)", fontSize: 13, fontWeight: "600" },
  exFooter: { color: "rgba(255,0,85,0.5)", fontSize: 11, fontStyle: "italic", letterSpacing: 1 },
  authorBox: { alignItems: "center", paddingVertical: 8 },
  authorText: { color: "rgba(0,255,255,0.15)", fontSize: 10, letterSpacing: 2 },
  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: CYAN, borderRadius: 4, paddingVertical: 16, marginTop: 4,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16, elevation: 8,
  },
  startBtnText: { color: "#000", fontSize: 14, fontWeight: "900", letterSpacing: 3 },
});
