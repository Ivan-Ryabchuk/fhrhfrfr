import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";
import { useGame } from "@/contexts/GameContext";
import { CATEGORIES } from "@/data/categories";
import { getHintForWord } from "@/data/hints";
import { getRandomQuestionPair } from "@/data/questions";
import { resolvePlayCategory } from "@/utils/categoryPlay";

const CYAN = "#00FFFF";
const MAGENTA = "#FF00FF";
const RED = "#FF0055";
const BG = "#050510";
const CARD = "rgba(0,255,255,0.04)";
const BORDER = "rgba(0,255,255,0.18)";

function Toggle({ value, onPress }: { value: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </Pressable>
  );
}

export default function SetupScreen() {
  const insets = useSafeAreaInsets();
  const {
    settings, updateSettings, setRoundRoles, setCurrentRevealIndex, setGamePhase,
    setCurrentQuestionPair, setPlayerAnswers, setCurrentAnswerIndex,
  } = useGame();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 80 : insets.bottom + 80;

  function changePlayerCount(delta: number) {
    const n = Math.min(20, Math.max(3, settings.players.length + delta));
    const current = settings.players;
    if (n > current.length) {
      const extra = Array.from({ length: n - current.length }, (_, i) => ({
        id: Date.now().toString() + i,
        name: `Игрок ${current.length + i + 1}`,
      }));
      updateSettings({ players: [...current, ...extra] });
    } else {
      updateSettings({ players: current.slice(0, n) });
    }
  }

  function changeImpostorCount(delta: number) {
    const max = Math.max(1, settings.players.length - 2);
    const n = Math.min(max, Math.max(1, settings.impostorCount + delta));
    updateSettings({ impostorCount: n });
  }

  async function startGame() {
    if (settings.players.length < 3) {
      Alert.alert("Мало игроков", "Нужно минимум 3 игрока.");
      return;
    }
    if (settings.gameMode !== "questions" && settings.selectedCategoryIds.length === 0) {
      Alert.alert("Нет категории", "Выбери хотя бы одну категорию.");
      return;
    }
    if (settings.gameMode === "questions") {
      const pair = getRandomQuestionPair();
      const shuffled = [...settings.players].sort(() => Math.random() - 0.5);
      const impostorIndexes = new Set<number>();
      while (impostorIndexes.size < settings.impostorCount) {
        impostorIndexes.add(Math.floor(Math.random() * shuffled.length));
      }
      const impostorNames = [...impostorIndexes].map((i) => shuffled[i].name);
      const roles = shuffled.map((p, i) => {
        const isImp = impostorIndexes.has(i);
        return {
          playerId: p.id,
          playerName: p.name,
          isImpostor: isImp,
          word: isImp ? "ШПИОН" : "АГЕНТ",
          category: pair.category,
          hintWord: "",
          impostorNames: settings.impostorsKnowEachOther ? impostorNames : [],
        };
      });
      setCurrentQuestionPair(pair);
      setPlayerAnswers([]);
      setCurrentAnswerIndex(0);
      setRoundRoles(roles as any);
      setCurrentRevealIndex(0);
      setGamePhase("questions");
      router.push("/questions");
      return;
    }

    const catId = settings.selectedCategoryIds[
      Math.floor(Math.random() * settings.selectedCategoryIds.length)
    ];

    const playCat = await resolvePlayCategory(catId);
    if (!playCat) {
      if (catId.startsWith("custom_slot_")) {
        const slotNum = catId.replace("custom_slot_", "");
        Alert.alert(
          "Слот пуст",
          `Слот ${slotNum} не заполнен (нужно хотя бы 2 слова). Откройте редактор.`,
          [
            { text: "Редактор", onPress: () => router.push(`/custom-slot/${slotNum}` as any) },
            { text: "Отмена" },
          ]
        );
      } else {
        Alert.alert("Ошибка", "Не удалось загрузить категорию.");
      }
      return;
    }

    const { name: catName, words: catWords, isCustom } = playCat;

    const word = catWords[Math.floor(Math.random() * catWords.length)];
    const shuffled = [...settings.players].sort(() => Math.random() - 0.5);
    const impostorIndexes = new Set<number>();
    while (impostorIndexes.size < settings.impostorCount) {
      impostorIndexes.add(Math.floor(Math.random() * shuffled.length));
    }

    const impostorNames = [...impostorIndexes].map((i) => shuffled[i].name);

    const roles = shuffled.map((p, i) => {
      const isImp = impostorIndexes.has(i);
      const wordForPlayer = isImp
        ? settings.showCategoryToImpostor
          ? catName
          : "???"
        : word;

      const semanticHint = !isCustom ? getHintForWord(word) : undefined;
      const otherWords = catWords.filter((w) => w !== word);
      const fallback = otherWords.length > 0
        ? otherWords[Math.floor(Math.random() * otherWords.length)]
        : catWords[0];
      const hintWord = semanticHint ?? fallback;

      return {
        playerId: p.id,
        playerName: p.name,
        isImpostor: isImp,
        word: wordForPlayer,
        category: catName,
        categoryId: catId,
        hintWord,
        impostorNames: settings.impostorsKnowEachOther ? impostorNames : [],
      };
    });

    setRoundRoles(roles as any);
    setCurrentRevealIndex(0);
    setGamePhase("reveal");
    router.push("/reveal");
  }

  const selectedCount = settings.selectedCategoryIds.length;
  const catNames = settings.selectedCategoryIds.slice(0, 3).map((id) => {
    if (id.startsWith("custom_slot_")) return `Слот ${id.replace("custom_slot_", "")}`;
    return CATEGORIES.find((c) => c.id === id)?.name ?? id;
  }).join(", ");
  const catLabel = selectedCount > 3 ? `${catNames} +${selectedCount - 3}` : catNames || "Не выбрано";

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <CyberBg />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={CYAN} />
        </Pressable>
        <Text style={styles.headerTitle}>НАСТРОЙКИ</Text>
        <Pressable style={styles.backBtn} onPress={() => router.push("/rules")}>
          <Feather name="help-circle" size={20} color={CYAN} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>// ИГРОКИ И ШПИОНЫ</Text>
        <View style={styles.row2}>
          <Pressable style={styles.counterCard} onPress={() => router.push("/players")}>
            <Text style={styles.counterIcon}>👥</Text>
            <Text style={styles.counterLabel}>Игроков</Text>
            <Text style={styles.counterValue}>{settings.players.length}</Text>
            <View style={styles.counterRow}>
              <Pressable style={styles.counterBtn} onPress={() => changePlayerCount(-1)}>
                <Text style={styles.counterBtnText}>−</Text>
              </Pressable>
              <Text style={styles.counterHint}>мин. 3</Text>
              <Pressable style={styles.counterBtn} onPress={() => changePlayerCount(1)}>
                <Text style={styles.counterBtnText}>+</Text>
              </Pressable>
            </View>
          </Pressable>

          <View style={[styles.counterCard, { borderColor: "rgba(255,0,85,0.3)" }]}>
            <Text style={styles.counterIcon}>🕵️</Text>
            <Text style={styles.counterLabel}>Шпионов</Text>
            <View style={styles.counterRow}>
              <Pressable style={[styles.counterBtn, { borderColor: "rgba(255,0,85,0.5)" }]} onPress={() => changeImpostorCount(-1)}>
                <Text style={[styles.counterBtnText, { color: RED }]}>−</Text>
              </Pressable>
              <Text style={[styles.counterValue, { color: RED }]}>{settings.impostorCount}</Text>
              <Pressable style={[styles.counterBtn, { borderColor: "rgba(255,0,85,0.5)" }]} onPress={() => changeImpostorCount(1)}>
                <Text style={[styles.counterBtnText, { color: RED }]}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>// РЕЖИМ ИГРЫ</Text>
        <View style={styles.row2}>
          <Pressable
            style={[styles.modeCard, settings.gameMode === "words" && styles.modeCardActive]}
            onPress={() => updateSettings({ gameMode: "words" })}
          >
            <Text style={styles.modeEmoji}>🔤</Text>
            <Text style={[styles.modeName, settings.gameMode === "words" && { color: CYAN }]}>СЛОВА</Text>
            <Text style={styles.modeDesc}>Найди того, кто не знает слово</Text>
          </Pressable>
          <Pressable
            style={[styles.modeCard, settings.gameMode === "questions" && styles.modeCardActive]}
            onPress={() => updateSettings({ gameMode: "questions" })}
          >
            <Text style={styles.modeEmoji}>❓</Text>
            <Text style={[styles.modeName, settings.gameMode === "questions" && { color: CYAN }]}>ВОПРОСЫ</Text>
            <Text style={styles.modeDesc}>Найди с другим вопросом</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>// КАТЕГОРИИ</Text>
        <Pressable style={styles.categoryCard} onPress={() => router.push("/categories")}>
          <Feather name="grid" size={16} color={CYAN} />
          <Text style={styles.categoryText} numberOfLines={1}>{catLabel}</Text>
          <Feather name="chevron-right" size={18} color={CYAN} />
        </Pressable>

        <View style={styles.togglesCard}>
          <Pressable
            style={styles.toggleRow}
            onPress={() => updateSettings({ showCategoryToImpostor: !settings.showCategoryToImpostor })}
          >
            <Text style={styles.toggleIcon}>👁️</Text>
            <Text style={styles.toggleLabel}>Показать категорию шпиону</Text>
            <Toggle value={settings.showCategoryToImpostor} onPress={() => updateSettings({ showCategoryToImpostor: !settings.showCategoryToImpostor })} />
          </Pressable>

          <View style={styles.toggleDivider} />

          <Pressable
            style={styles.toggleRow}
            onPress={() => updateSettings({ showHintToImpostor: !settings.showHintToImpostor })}
          >
            <Text style={styles.toggleIcon}>🪞</Text>
            <Text style={styles.toggleLabel}>Показать подсказку шпиону</Text>
            <Toggle value={settings.showHintToImpostor} onPress={() => updateSettings({ showHintToImpostor: !settings.showHintToImpostor })} />
          </Pressable>

          <View style={styles.toggleDivider} />

          <Pressable
            style={styles.toggleRow}
            onPress={() => updateSettings({ impostorsKnowEachOther: !settings.impostorsKnowEachOther })}
          >
            <Text style={styles.toggleIcon}>🤝</Text>
            <Text style={styles.toggleLabel}>Шпионы знают друг друга</Text>
            <Toggle value={settings.impostorsKnowEachOther} onPress={() => updateSettings({ impostorsKnowEachOther: !settings.impostorsKnowEachOther })} />
          </Pressable>

          <View style={styles.toggleDivider} />

          <Pressable
            style={styles.toggleRow}
            onPress={() => updateSettings({ enableVoting: !settings.enableVoting })}
          >
            <Text style={styles.toggleIcon}>🗳️</Text>
            <Text style={styles.toggleLabel}>Голосование за исключение</Text>
            <Toggle value={settings.enableVoting} onPress={() => updateSettings({ enableVoting: !settings.enableVoting })} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>// ТАЙМЕР</Text>
        <View style={styles.counterCard}>
          <View style={styles.counterRow}>
            <Pressable style={styles.counterBtn} onPress={() => updateSettings({ timerMinutes: Math.max(1, settings.timerMinutes - 1) })}>
              <Text style={styles.counterBtnText}>−</Text>
            </Pressable>
            <Text style={[styles.counterValue, { fontSize: 28 }]}>
              {settings.timerMinutes}
              <Text style={{ fontSize: 14, color: "rgba(0,255,255,0.5)" }}> мин</Text>
            </Text>
            <Pressable style={styles.counterBtn} onPress={() => updateSettings({ timerMinutes: Math.min(30, settings.timerMinutes + 1) })}>
              <Text style={styles.counterBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <Pressable style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.8 }]} onPress={startGame}>
          <Feather name="zap" size={20} color="#000" />
          <Text style={styles.startBtnText}>ЗАПУСТИТЬ ИГРУ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { padding: 6, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  headerTitle: {
    color: CYAN, fontSize: 16, fontWeight: "900", letterSpacing: 4,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  scroll: { paddingHorizontal: 16, gap: 10, paddingTop: 12 },
  sectionLabel: { color: MAGENTA, fontSize: 11, letterSpacing: 2, fontWeight: "700", marginTop: 4 },
  row2: { flexDirection: "row", gap: 10 },
  counterCard: {
    flex: 1, backgroundColor: CARD, borderRadius: 4, padding: 14,
    alignItems: "center", gap: 6, borderWidth: 1, borderColor: BORDER,
  },
  counterIcon: { fontSize: 24 },
  counterLabel: { color: "rgba(0,255,255,0.55)", fontSize: 12, textAlign: "center", letterSpacing: 1 },
  counterHint: { color: "rgba(0,255,255,0.3)", fontSize: 10, letterSpacing: 1 },
  counterRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  counterBtn: {
    width: 36, height: 36, borderRadius: 4, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: BORDER, backgroundColor: "rgba(0,255,255,0.05)",
  },
  counterBtnText: { color: CYAN, fontSize: 22, fontWeight: "700", lineHeight: 26 },
  counterValue: {
    color: CYAN, fontSize: 26, fontWeight: "900", minWidth: 44, textAlign: "center",
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  modeCard: {
    flex: 1, backgroundColor: CARD, borderRadius: 4, padding: 14,
    alignItems: "center", gap: 6, borderWidth: 1.5, borderColor: BORDER,
  },
  modeCardActive: { borderColor: CYAN, backgroundColor: "rgba(0,255,255,0.06)" },
  modeEmoji: { fontSize: 26 },
  modeName: { color: "rgba(0,255,255,0.55)", fontSize: 13, fontWeight: "800", letterSpacing: 2 },
  modeDesc: { color: "rgba(224,224,255,0.35)", fontSize: 10, textAlign: "center" },
  categoryCard: {
    backgroundColor: CARD, borderRadius: 4, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: BORDER,
  },
  categoryText: { flex: 1, color: "rgba(0,255,255,0.8)", fontSize: 14, fontWeight: "600" },
  togglesCard: {
    backgroundColor: CARD, borderRadius: 4, borderWidth: 1, borderColor: BORDER, overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 14,
  },
  toggleDivider: { height: 1, backgroundColor: BORDER, marginHorizontal: 14 },
  toggleIcon: { fontSize: 18 },
  toggleLabel: { flex: 1, color: "rgba(0,255,255,0.65)", fontSize: 13 },
  toggle: {
    width: 44, height: 24, borderRadius: 12, backgroundColor: "#1a1a2e",
    justifyContent: "center", paddingHorizontal: 2, borderWidth: 1, borderColor: BORDER,
  },
  toggleOn: { backgroundColor: "rgba(0,255,255,0.2)", borderColor: CYAN },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(0,255,255,0.4)" },
  toggleThumbOn: { alignSelf: "flex-end", backgroundColor: CYAN },
  footer: {
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: BG,
  },
  startBtn: {
    backgroundColor: CYAN, borderRadius: 4, paddingVertical: 18,
    alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 12,
  },
  startBtnText: { color: "#000", fontSize: 16, fontWeight: "900", letterSpacing: 3 },
});
