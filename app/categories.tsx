import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AdsFooter from "@/components/AdsFooter";
import CyberBg from "@/components/CyberBg";
import { useGame } from "@/contexts/GameContext";
import { CATEGORIES, isBuiltInCategoryFreelyAvailable } from "@/data/categories";
import {
  getCustomSlotData,
  isCategoryAvailable,
  isCustomSlotEditorAvailable,
  unlockCategory,
} from "@/utils/AdStorage";
import { watchRewardedVideos } from "@/utils/rewardedAds";

const BG = "#050510";
const CYAN = "#00FFFF";
const MAGENTA = "#FF00FF";
const TEXT = "#E0E0FF";

// Unique neon color per built-in category
const CAT_COLORS: Record<string, string> = {
  animals:     "#00FFFF",
  food:        "#FF00FF",
  objects:     "#00FF41",
  movies:      "#FFE600",
  places:      "#FF4444",
  sports:      "#9B59FF",
  professions: "#00BFFF",
  brands:      "#FF8C00",
  tools:       "#39FF14",
  transport:   "#00FFD1",
  superpowers: "#FF44EE",
  fears:       "#FF2052",
  inventions:  "#FFAA00",
  celebrities: "#FFD700",
  games:       "#00FF7F",
  anime:       "#FF1493",
  health:      "#00FA9A",
  education:   "#87CEEB",
  hobbies:     "#FF6347",
  romance:     "#FF69B4",
  countries:   "#00CED1",
  cities:      "#9370DB",
  christmas:   "#FF4500",
};

const CUSTOM_SLOTS = [1, 2, 3, 4];

interface SlotInfo {
  slot: number;
  name: string | null;
  wordCount: number;
  editorUnlocked: boolean;
}

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useGame();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [lockModal, setLockModal] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadState = useCallback(async () => {
    // Built-in unlock states
    const locked = CATEGORIES.filter((c) => !isBuiltInCategoryFreelyAvailable(c.id));
    const checks = await Promise.all(locked.map((c) => isCategoryAvailable(c.id)));
    setUnlockedIds(new Set(locked.filter((_, i) => checks[i]).map((c) => c.id)));

    // Custom slots
    const s: SlotInfo[] = await Promise.all(
      CUSTOM_SLOTS.map(async (n) => {
        const data = await getCustomSlotData(n);
        const editorUnlocked = await isCustomSlotEditorAvailable(n);
        return { slot: n, name: data?.name ?? null, wordCount: data?.words.length ?? 0, editorUnlocked };
      })
    );
    setSlots(s);
  }, []);

  useEffect(() => { loadState(); }, [loadState]);

  const totalSelectable = CATEGORIES.length + CUSTOM_SLOTS.length;
  const selectedCount = settings.selectedCategoryIds.length;

  function isAvail(id: string) {
    if (isBuiltInCategoryFreelyAvailable(id)) return true;
    return unlockedIds.has(id);
  }

  function toggle(id: string) {
    if (!isAvail(id)) {
      const cat = CATEGORIES.find((c) => c.id === id);
      setLockModal({ id, name: cat?.name ?? id });
      return;
    }
    const cur = settings.selectedCategoryIds;
    if (cur.includes(id)) {
      if (cur.length <= 1) { Alert.alert("Минимум 1 категория", "Нельзя убрать все."); return; }
      updateSettings({ selectedCategoryIds: cur.filter((x) => x !== id) });
    } else {
      updateSettings({ selectedCategoryIds: [...cur, id] });
    }
  }

  function toggleSlot(slot: number) {
    const id = `custom_slot_${slot}`;
    const info = slots.find((s) => s.slot === slot);
    if (!info || info.wordCount < 2) {
      Alert.alert("Слот пуст", "Сначала добавьте слова.", [
        { text: "Редактор", onPress: () => router.push(`/custom-slot/${slot}` as any) },
        { text: "Отмена" },
      ]);
      return;
    }
    const cur = settings.selectedCategoryIds;
    if (cur.includes(id)) {
      if (cur.length <= 1) { Alert.alert("Минимум 1 категория", "Нельзя убрать все."); return; }
      updateSettings({ selectedCategoryIds: cur.filter((x) => x !== id) });
    } else {
      updateSettings({ selectedCategoryIds: [...cur, id] });
    }
  }

  function resetAll() {
    updateSettings({ selectedCategoryIds: ["animals", "food", "objects", "sports", "professions"] });
  }

  async function handleUnlock() {
    if (!lockModal) return;
    const snap = lockModal;
    setLockModal(null);
    setLoading(true);
    const ok = await watchRewardedVideos(2);
    if (ok) {
      await unlockCategory(snap.id);
      await loadState();
      Alert.alert("Разблокировано!", `«${snap.name}» доступна на 36 часов.`);
    } else {
      Alert.alert("Отменено", "Реклама не досмотрена.");
    }
    setLoading(false);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <CyberBg />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.allBtn} onPress={() => {}}>
          <Text style={styles.allBtnText}>ВСЕ</Text>
        </Pressable>
        <Text style={styles.counter}>
          <Text style={{ color: CYAN }}>{selectedCount}</Text>
          <Text style={{ color: "rgba(0,255,255,0.4)" }}> / {CATEGORIES.length + CUSTOM_SLOTS.filter((s) => (slots.find((x) => x.slot === s)?.wordCount ?? 0) >= 2).length}</Text>
        </Text>
        <Pressable style={styles.resetBtn} onPress={resetAll}>
          <Text style={styles.resetBtnText}>СБРОС</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Custom Slots (list style) ── */}
        <View style={styles.slotsList}>
          {CUSTOM_SLOTS.map((n) => {
            const info = slots.find((s) => s.slot === n);
            const id = `custom_slot_${n}`;
            const hasWords = (info?.wordCount ?? 0) >= 2;
            const selected = settings.selectedCategoryIds.includes(id);
            return (
              <Pressable
                key={n}
                style={[styles.slotRow, hasWords && styles.slotRowFilled, selected && styles.slotRowSelected]}
                onPress={() => hasWords ? toggleSlot(n) : router.push(`/custom-slot/${n}` as any)}
              >
                <Text style={styles.slotEmoji}>🖊</Text>
                <View style={styles.slotInfo}>
                  <Text style={[styles.slotName, selected && { color: CYAN }]}>
                    {info?.name && info.name !== `Слот ${n}` ? info.name : (hasWords ? info?.name ?? `Свой слот ${n}` : `Свой слот ${n}`)}
                  </Text>
                  <Text style={styles.slotSub}>
                    {hasWords
                      ? `${info!.wordCount} слов · нажми чтобы изменить`
                      : "Пустой слот · нажми чтобы создать"}
                  </Text>
                </View>
                {hasWords && (
                  <Pressable
                    style={styles.slotPlusBtn}
                    onPress={() => router.push(`/custom-slot/${n}` as any)}
                  >
                    <Text style={styles.slotPlusBtnText}>+</Text>
                  </Pressable>
                )}
                <Feather name="chevron-right" size={16} color={hasWords ? "#00FF41" : "rgba(255,255,255,0.2)"} />
              </Pressable>
            );
          })}
        </View>

        {/* ── Built-in categories (colored grid) ── */}
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => {
            const color = CAT_COLORS[cat.id] ?? CYAN;
            const free = isBuiltInCategoryFreelyAvailable(cat.id);
            const avail = free || unlockedIds.has(cat.id);
            const sel = settings.selectedCategoryIds.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.catCard,
                  { borderColor: avail ? `${color}55` : "rgba(255,255,255,0.08)" },
                  sel && { borderColor: color, backgroundColor: `${color}12` },
                ]}
                onPress={() => toggle(cat.id)}
              >
                {/* Checkmark */}
                {sel && (
                  <View style={[styles.checkBox, { backgroundColor: color }]}>
                    <Feather name="check" size={10} color="#000" />
                  </View>
                )}
                {/* Lock */}
                {!avail && (
                  <View style={styles.lockBadge}>
                    <Feather name="lock" size={9} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
                <Text style={[styles.catName, { color: avail ? color : "rgba(255,255,255,0.25)" }]}>
                  {cat.name}
                </Text>
                <View style={styles.catCountRow}>
                  <View style={[styles.bullet, { backgroundColor: avail ? color : "rgba(255,255,255,0.15)" }]} />
                  <Text style={[styles.catCount, { color: avail ? `${color}99` : "rgba(255,255,255,0.2)" }]}>
                    {cat.words.length} слов
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Lock modal */}
      <Modal visible={!!lockModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Feather name="lock" size={32} color={MAGENTA} style={{ opacity: 0.7 }} />
            <Text style={styles.modalTitle}>ЗАБЛОКИРОВАНО</Text>
            <Text style={styles.modalCat}>{lockModal?.name}</Text>
            <Text style={styles.modalDesc}>
              Посмотрите 2 ролика, чтобы открыть категорию на 36 часов.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.modalBtn, pressed && { opacity: 0.8 }, loading && { opacity: 0.5 }]}
              onPress={handleUnlock}
              disabled={loading}
            >
              <Text style={styles.modalBtnText}>{loading ? "ЗАГРУЗКА..." : "▶  ПОСМОТРЕТЬ РЕКЛАМУ (2×)"}</Text>
            </Pressable>
            <Pressable onPress={() => setLockModal(null)} style={{ paddingVertical: 10 }}>
              <Text style={styles.modalCancel}>ОТМЕНА</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <AdsFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,255,255,0.08)",
  },
  allBtn: {
    borderWidth: 1.5,
    borderColor: CYAN,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  allBtnText: { color: CYAN, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  counter: { fontSize: 16, fontWeight: "700" },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: MAGENTA,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  resetBtnText: { color: MAGENTA, fontSize: 12, fontWeight: "900", letterSpacing: 1 },

  content: { padding: 12, gap: 12 },

  /* Slots */
  slotsList: { gap: 8 },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  slotRowFilled: {
    borderColor: "rgba(0,255,65,0.3)",
    backgroundColor: "rgba(0,255,65,0.04)",
  },
  slotRowSelected: {
    borderColor: "#00FF41",
    backgroundColor: "rgba(0,255,65,0.08)",
  },
  slotEmoji: { fontSize: 22 },
  slotInfo: { flex: 1 },
  slotName: { color: TEXT, fontSize: 15, fontWeight: "700" },
  slotSub: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 },
  slotPlusBtn: {
    width: 30,
    height: 30,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#00FF41",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,65,0.1)",
  },
  slotPlusBtnText: { color: "#00FF41", fontSize: 18, fontWeight: "900", lineHeight: 22 },

  /* Built-in grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catCard: {
    width: "47.5%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    minHeight: 80,
    justifyContent: "flex-end",
    gap: 6,
    position: "relative",
    overflow: "hidden",
  },
  checkBox: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  lockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    fontSize: 15,
    fontWeight: "800",
  },
  catCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  catCount: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* Modal */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,5,16,0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    backgroundColor: "#0a0a20",
    borderWidth: 1.5,
    borderColor: MAGENTA,
    borderRadius: 10,
    padding: 24,
    gap: 12,
    alignItems: "center",
    shadowColor: MAGENTA,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: { color: MAGENTA, fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  modalCat: { color: TEXT, fontSize: 20, fontWeight: "900" },
  modalDesc: { color: "rgba(224,224,255,0.6)", fontSize: 13, textAlign: "center", lineHeight: 20 },
  modalBtn: {
    backgroundColor: MAGENTA,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 6,
    width: "100%",
    alignItems: "center",
  },
  modalBtnText: { color: "#000", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  modalCancel: { color: "rgba(224,224,255,0.3)", fontSize: 12, letterSpacing: 1 },
});
