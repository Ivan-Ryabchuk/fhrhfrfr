import { getCategoryById } from "@/data/categories";

import { getCustomSlotData } from "./AdStorage";

export interface PlayCategory {
  id: string;
  name: string;
  words: string[];
  isCustom: boolean;
}

/**
 * Resolve a category ID to its name and word list.
 * Handles both built-in categories and custom slot categories.
 */
export async function resolvePlayCategory(
  categoryId: string
): Promise<PlayCategory | null> {
  if (categoryId.startsWith("custom_slot_")) {
    const slotNum = parseInt(categoryId.replace("custom_slot_", ""), 10);
    if (isNaN(slotNum)) return null;
    const data = await getCustomSlotData(slotNum);
    if (!data || data.words.length < 2) return null;
    return { id: categoryId, name: data.name || `Слот ${slotNum}`, words: data.words, isCustom: true };
  }

  const cat = getCategoryById(categoryId);
  if (!cat) return null;
  return { id: cat.id, name: cat.name, words: cat.words, isCustom: false };
}
