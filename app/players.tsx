import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CyberBg from "@/components/CyberBg";
import { Player, useGame } from "@/contexts/GameContext";

const CYAN = "#00FFFF";
const RED = "#FF0055";
const BG = "#050510";
const CARD = "rgba(0,255,255,0.04)";
const BORDER = "rgba(0,255,255,0.18)";

const AVATAR_COLORS = ["#00FFFF", "#FF00FF", "#00FF41", "#FFE600", "#FF0055", "#7B61FF", "#00E5FF", "#FF6B35"];

export default function PlayersScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useGame();
  const [editingId, setEditingId] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 + 90 : insets.bottom + 90;

  function updateName(id: string, name: string) {
    updateSettings({ players: settings.players.map((p) => (p.id === id ? { ...p, name } : p)) });
  }

  function addPlayer() {
    const n = settings.players.length + 1;
    const newP: Player = { id: Date.now().toString(), name: `Игрок ${n}` };
    updateSettings({ players: [...settings.players, newP] });
  }

  function removePlayer(id: string) {
    if (settings.players.length <= 3) {
      Alert.alert("Минимум 3 игрока", "Нельзя удалить — нужно хотя бы 3 игрока.");
      return;
    }
    updateSettings({ players: settings.players.filter((p) => p.id !== id) });
  }

  const avatarColor = (name: string) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <CyberBg />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={CYAN} />
        </Pressable>
        <Text style={styles.headerTitle}>ИГРОКИ</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.countRow}>
        <View>
          <Text style={styles.countText}>
            <Text style={{ color: CYAN }}>{settings.players.length}</Text>
            <Text style={{ color: "rgba(0,255,255,0.4)" }}> / 20 агентов</Text>
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable style={[styles.miniBtn, { backgroundColor: "rgba(255,0,85,0.15)", borderColor: RED }]} onPress={() => settings.players.length > 3 && removePlayer(settings.players[settings.players.length - 1].id)}>
            <Text style={[styles.miniBtnText, { color: RED }]}>−</Text>
          </Pressable>
          <Text style={styles.minHint}>3+</Text>
          <Pressable style={[styles.miniBtn, { backgroundColor: "rgba(0,255,255,0.15)", borderColor: CYAN }]} onPress={addPlayer}>
            <Text style={[styles.miniBtnText, { color: CYAN }]}>+</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={settings.players}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: botPad, paddingTop: 4 }}
        renderItem={({ item, index }) => {
          const col = avatarColor(item.name);
          const editing = editingId === item.id;
          return (
            <View style={[styles.playerRow, { borderColor: `${col}30` }]}>
              <View style={[styles.avatar, { backgroundColor: `${col}20`, borderColor: `${col}60` }]}>
                <Text style={[styles.avatarText, { color: col }]}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              {editing ? (
                <TextInput
                  style={[styles.nameInput, { borderBottomColor: col }]}
                  value={item.name}
                  onChangeText={(t) => updateName(item.id, t)}
                  onBlur={() => setEditingId(null)}
                  autoFocus
                  placeholderTextColor="rgba(0,255,255,0.3)"
                  selectionColor={CYAN}
                />
              ) : (
                <Pressable style={styles.namePress} onPress={() => setEditingId(item.id)}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <Feather name="edit-2" size={12} color="rgba(0,255,255,0.25)" />
                </Pressable>
              )}
              <Text style={styles.badge}>#{String(index + 1).padStart(2, "0")}</Text>
              <Pressable style={styles.removeBtn} onPress={() => removePlayer(item.id)}>
                <Feather name="x" size={16} color="rgba(255,0,85,0.5)" />
              </Pressable>
            </View>
          );
        }}
      />

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <Pressable
          style={[styles.footerBtn, { borderColor: "rgba(255,0,85,0.4)" }]}
          onPress={() => settings.players.length > 3 && removePlayer(settings.players[settings.players.length - 1].id)}
        >
          <Feather name="user-minus" size={16} color={RED} />
          <Text style={[styles.footerBtnText, { color: RED }]}>УДАЛИТЬ</Text>
        </Pressable>
        <Pressable style={[styles.footerBtn, { borderColor: CYAN, backgroundColor: "rgba(0,255,255,0.06)" }]} onPress={addPlayer}>
          <Feather name="user-plus" size={16} color={CYAN} />
          <Text style={[styles.footerBtnText, { color: CYAN }]}>ДОБАВИТЬ</Text>
        </Pressable>
      </View>
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
  countRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  countText: { fontSize: 15, fontWeight: "700" },
  minHint: { color: CYAN, fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  miniBtn: { width: 40, height: 40, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  miniBtnText: { fontSize: 22, fontWeight: "900", lineHeight: 26 },
  playerRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: CARD,
    borderRadius: 4, paddingVertical: 10, paddingHorizontal: 12, gap: 10, borderWidth: 1,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  avatarText: { fontSize: 16, fontWeight: "900" },
  namePress: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  nameText: { color: "rgba(224,224,255,0.9)", fontSize: 15, fontWeight: "600", flex: 1 },
  nameInput: {
    flex: 1, color: CYAN, fontSize: 15, fontWeight: "600",
    borderBottomWidth: 1.5, paddingVertical: 2,
  },
  badge: { color: "rgba(0,255,255,0.3)", fontSize: 11, fontWeight: "700", fontVariant: ["tabular-nums"] },
  removeBtn: { padding: 4 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER,
  },
  footerBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 4, paddingVertical: 14, borderWidth: 1.5,
  },
  footerBtnText: { fontSize: 13, fontWeight: "800", letterSpacing: 2 },
});
