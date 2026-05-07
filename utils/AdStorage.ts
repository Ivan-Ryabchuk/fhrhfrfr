import AsyncStorage from "@react-native-async-storage/async-storage";

// 36 hours in milliseconds
export const CATEGORY_UNLOCK_MS = 129_600_000;
// 10 days in milliseconds
export const CUSTOM_SLOT_EDITOR_MS = 864_000_000;

export async function unlockCategory(id: string): Promise<void> {
  const until = Date.now() + CATEGORY_UNLOCK_MS;
  await AsyncStorage.setItem(`cat_unlock_${id}`, String(until));
}

export async function isCategoryAvailable(id: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(`cat_unlock_${id}`);
  if (!raw) return false;
  return Date.now() < Number(raw);
}

export async function unlockCustomSlotEditor(slot: number): Promise<void> {
  const until = Date.now() + CUSTOM_SLOT_EDITOR_MS;
  await AsyncStorage.setItem(`custom_slot_${slot}_access_until`, String(until));
}

export async function isCustomSlotEditorAvailable(slot: number): Promise<boolean> {
  const raw = await AsyncStorage.getItem(`custom_slot_${slot}_access_until`);
  if (!raw) return false;
  return Date.now() < Number(raw);
}

export async function getCustomSlotData(
  slot: number
): Promise<{ name: string; words: string[] } | null> {
  const raw = await AsyncStorage.getItem(`custom_slot_${slot}_data`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveCustomSlotData(
  slot: number,
  data: { name: string; words: string[] }
): Promise<void> {
  await AsyncStorage.setItem(`custom_slot_${slot}_data`, JSON.stringify(data));
}

export async function clearCustomSlotData(slot: number): Promise<void> {
  await AsyncStorage.removeItem(`custom_slot_${slot}_data`);
  await AsyncStorage.removeItem(`custom_slot_${slot}_access_until`);
}
