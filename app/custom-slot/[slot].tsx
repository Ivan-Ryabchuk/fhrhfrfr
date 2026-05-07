import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
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

import AdsFooter from "@/components/AdsFooter";
import CyberBg from "@/components/CyberBg";
import {
  clearCustomSlotData,
  getCustomSlotData,
  isCustomSlotEditorAvailable,
  saveCustomSlotData,
  unlockCustomSlotEditor,
} from "@/utils/AdStorage";
import { parseWordList } from "@/utils/parseWordList";
import { watchRewardedVideos } from "@/utils/rewardedAds";

const CYAN = "#00FFFF";
const MAGENTA = "#FF00FF";
const BG = "#050510";
const TEXT = "#E0E0FF";

export default function CustomSlotScreen() {
  const { slot } = useLocalSearchParams<{ slot: string }>();
  const slotNum = parseInt(slot ?? "1", 10);
  const insets = useSafeAreaInsets();

  const [editorUnlocked, setEditorUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [wordsRaw, setWordsRaw] = useState("");
  const [saving, setSaving] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const wordList = parseWordList(wordsRaw);

  const load = useCallback(async () => {
    const [data, unlocked] = await Promise.all([
      getCustomSlotData(slotNum),
      isCustomSlotEditorAvailable(slotNum),
    ]);
    setEditorUnlocked(unlocked);
    if (data) {
      setName(data.name);
      setWordsRaw(data.words.join("\n"));
    }
  }, [slotNum]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUnlock() {
    setUnlocking(true);
    const ok = await watchRewardedVideos(2);
    if (ok) {
      await unlockCustomSlotEditor(slotNum);
      setEditorUnlocked(true);
      Alert.alert("Разблокировано!", "Редактор открыт на 10 дней.");
    } else {
      Alert.alert("Отменено", "Реклама не была досмотрена до конца.");
    }
    setUnlocking(false);
  }

  async function handleSave() {
    if (wordList.length < 2) {
      Alert.alert("Мало слов", "Добавьте хотя бы 2 слова.");
      return;
    }
    setSaving(true);
    await saveCustomSlotData(slotNum, { name: name.trim() || `Слот ${slotNum}`, words: wordList });
    setSaving(false);
    Alert.alert("Сохранено", `Слот ${slotNum} обновлён (${wordList.length} слов).`);
  }

  async function handleClear() {
    Alert.alert(
      "Очистить слот",
      `Удалить все данные слота ${slotNum}?`,
      [
        {
          text: "Очистить",
          style: "destructive",
          onPress: async () => {
            await clearCustomSlotData(slotNum);
            setName("");
            setWordsRaw("");
            setEditorUnlocked(false);
          },
        },
        { text: "Отмена", style: "cancel" },
      ]
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <CyberBg />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="chevron-left" size={22} color={CYAN} />
          <Text style={styles.backText}>НАЗАД</Text>
        </Pressable>
        <Text style={styles.headerTitle}>СЛОТ {slotNum}</Text>
        <Pressable onPress={handleClear} hitSlop={8}>
          <Feather name="trash-2" size={18} color="rgba(255,0,55,0.6)" />
        </Pressable>
      </View>

      {!editorUnlocked ? (
        /* Locked state */
        <View style={styles.lockedContainer}>
          <Feather name="lock" size={48} color={MAGENTA} style={{ opacity: 0.6 }} />
          <Text style={styles.lockedTitle}>РЕДАКТОР ЗАБЛОКИРОВАН</Text>
          <Text style={styles.lockedDesc}>
            Посмотрите 2 рекламных ролика, чтобы открыть редактор на 10 дней.
          </Text>
          {wordList.length > 0 && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>ТЕКУЩИЕ ДАННЫЕ (только просмотр)</Text>
              <Text style={styles.previewName}>{name || `Слот ${slotNum}`}</Text>
              <Text style={styles.previewCount}>{wordList.length} слов</Text>
            </View>
          )}
          <Pressable
            style={({ pressed }) => [styles.unlockBtn, pressed && { opacity: 0.8 }, unlocking && { opacity: 0.6 }]}
            onPress={handleUnlock}
            disabled={unlocking}
          >
            <Feather name="play-circle" size={18} color="#000" />
            <Text style={styles.unlockBtnText}>
              {unlocking ? "ЗАГРУЗКА..." : "РАЗБЛОКИРОВАТЬ (2 ролика)"}
            </Text>
          </Pressable>
        </View>
      ) : (
        /* Editor */
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.editorContent} keyboardShouldPersistTaps="handled">
            {/* Name input */}
            <Text style={styles.fieldLabel}>НАЗВАНИЕ КАТЕГОРИИ</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder={`Слот ${slotNum}`}
              placeholderTextColor="rgba(224,224,255,0.25)"
              maxLength={40}
              returnKeyType="next"
            />

            {/* Words textarea */}
            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>
              СЛОВА (каждое с новой строки или через запятую)
            </Text>
            <TextInput
              style={styles.wordsInput}
              value={wordsRaw}
              onChangeText={setWordsRaw}
              multiline
              placeholder={"Слово 1\nСлово 2\nСлово 3"}
              placeholderTextColor="rgba(224,224,255,0.2)"
              textAlignVertical="top"
              autoCapitalize="sentences"
            />

            {/* Word count */}
            <Text style={styles.wordCount}>
              {wordList.length} слов{wordList.length < 2 ? " (нужно минимум 2)" : " ✓"}
            </Text>

            {/* Preview chips */}
            {wordList.length > 0 && (
              <View style={styles.previewChips}>
                {wordList.slice(0, 12).map((w, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{w}</Text>
                  </View>
                ))}
                {wordList.length > 12 && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>+{wordList.length - 12}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Save button */}
            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && { opacity: 0.85 },
                saving && { opacity: 0.6 },
                wordList.length < 2 && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={saving || wordList.length < 2}
            >
              <Feather name="save" size={16} color="#000" />
              <Text style={styles.saveBtnText}>
                {saving ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ"}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,255,255,0.1)",
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { color: CYAN, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  headerTitle: { color: TEXT, fontSize: 14, fontWeight: "900", letterSpacing: 3 },
  /* Locked */
  lockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 18,
  },
  lockedTitle: {
    color: MAGENTA,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  lockedDesc: {
    color: "rgba(224,224,255,0.6)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  previewBox: {
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.14)",
    borderRadius: 6,
    padding: 16,
    gap: 6,
    alignItems: "center",
    width: "100%",
  },
  previewLabel: {
    color: "rgba(0,255,255,0.5)",
    fontSize: 8,
    letterSpacing: 2,
    fontWeight: "700",
  },
  previewName: { color: TEXT, fontSize: 15, fontWeight: "700" },
  previewCount: { color: "rgba(224,224,255,0.45)", fontSize: 11 },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: MAGENTA,
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    shadowColor: MAGENTA,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  unlockBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  /* Editor */
  editorContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldLabel: {
    color: CYAN,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 3,
    opacity: 0.7,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: "rgba(0,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.2)",
    borderRadius: 4,
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  wordsInput: {
    backgroundColor: "rgba(0,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.14)",
    borderRadius: 4,
    color: TEXT,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 220,
    lineHeight: 22,
  },
  wordCount: {
    color: "rgba(224,224,255,0.35)",
    fontSize: 11,
    marginTop: 6,
    textAlign: "right",
  },
  previewChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
  },
  chip: {
    backgroundColor: "rgba(0,255,255,0.08)",
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    color: CYAN,
    fontSize: 11,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: CYAN,
    borderRadius: 4,
    paddingVertical: 16,
    marginTop: 24,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "rgba(0,255,255,0.3)",
    shadowOpacity: 0,
  },
  saveBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
