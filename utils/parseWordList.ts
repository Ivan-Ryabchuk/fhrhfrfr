/**
 * Parse a comma- or newline-separated word list.
 * Returns unique, trimmed, non-empty words, up to maxWords.
 */
export function parseWordList(raw: string, maxWords = 500): string[] {
  return raw
    .split(/[,\n]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
    .slice(0, maxWords);
}
