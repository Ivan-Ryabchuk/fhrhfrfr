import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { QuestionPair } from "@/data/questions";
import { saveCustomSlotData, getCustomSlotData } from "@/utils/AdStorage";

export interface Player {
  id: string;
  name: string;
}

export interface GameSettings {
  players: Player[];
  impostorCount: number;
  selectedCategoryIds: string[];
  gameMode: "words" | "questions";
  showCategoryToImpostor: boolean;
  showHintToImpostor: boolean;
  impostorsKnowEachOther: boolean;
  timerMinutes: number;
  enableVoting: boolean;
}

export interface RoundRole {
  playerId: string;
  playerName: string;
  isImpostor: boolean;
  word: string;
  category: string;
  hintWord?: string;
  impostorNames?: string[];
}

export interface PlayerAnswer {
  playerId: string;
  playerName: string;
  question: string;
  answer: string;
}

export interface GameContextValue {
  settings: GameSettings;
  updateSettings: (s: Partial<GameSettings>) => void;
  roundRoles: RoundRole[];
  setRoundRoles: (roles: RoundRole[]) => void;
  currentRevealIndex: number;
  setCurrentRevealIndex: (i: number) => void;
  gamePhase: "idle" | "reveal" | "questions" | "playing" | "result";
  setGamePhase: (p: "idle" | "reveal" | "questions" | "playing" | "result") => void;
  impostors: string[];
  setImpostors: (ids: string[]) => void;
  currentQuestionPair: QuestionPair | null;
  setCurrentQuestionPair: (q: QuestionPair | null) => void;
  playerAnswers: PlayerAnswer[];
  setPlayerAnswers: (a: PlayerAnswer[]) => void;
  currentAnswerIndex: number;
  setCurrentAnswerIndex: (i: number) => void;
  resetGame: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  players: [
    { id: "1", name: "Игрок 1" },
    { id: "2", name: "Игрок 2" },
    { id: "3", name: "Игрок 3" },
    { id: "4", name: "Игрок 4" },
    { id: "5", name: "Игрок 5" },
  ],
  impostorCount: 1,
  selectedCategoryIds: ["animals", "food", "objects", "sports", "professions"],
  gameMode: "words",
  showCategoryToImpostor: true,
  showHintToImpostor: false,
  impostorsKnowEachOther: false,
  timerMinutes: 5,
  enableVoting: false,
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [roundRoles, setRoundRoles] = useState<RoundRole[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<"idle" | "reveal" | "questions" | "playing" | "result">("idle");
  const [impostors, setImpostors] = useState<string[]>([]);
  const [currentQuestionPair, setCurrentQuestionPair] = useState<QuestionPair | null>(null);
  const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswer[]>([]);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem("game_settings").then(async (raw) => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw) as Partial<GameSettings> & {
          customCategory?: { name: string; words: string[] } | null;
        };

        // Migration: move old customCategory → custom_slot_1
        if (saved.customCategory && saved.customCategory.words.length > 0) {
          const existing = await getCustomSlotData(1);
          if (!existing) {
            await saveCustomSlotData(1, saved.customCategory);
          }
          delete saved.customCategory;
        }

        // Migration: replace old __custom__ category id with custom_slot_1
        if (saved.selectedCategoryIds) {
          saved.selectedCategoryIds = saved.selectedCategoryIds.map((id) =>
            id === "__custom__" || id === "custom" ? "custom_slot_1" : id
          );
        }

        // Strip customCategory key from saved settings
        const { customCategory: _dropped, ...cleanSaved } = saved as any;

        setSettings((prev) => ({ ...prev, ...cleanSaved }));
      } catch {}
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      // Always clamp impostorCount: min 1, max players.length - 2 (need at least 2 non-impostors)
      const maxImpostors = Math.max(1, next.players.length - 2);
      next.impostorCount = Math.min(Math.max(1, next.impostorCount), maxImpostors);
      AsyncStorage.setItem("game_settings", JSON.stringify(next));
      return next;
    });
  }, []);

  const resetGame = useCallback(() => {
    setRoundRoles([]);
    setCurrentRevealIndex(0);
    setGamePhase("idle");
    setImpostors([]);
    setCurrentQuestionPair(null);
    setPlayerAnswers([]);
    setCurrentAnswerIndex(0);
  }, []);

  return (
    <GameContext.Provider
      value={{
        settings,
        updateSettings,
        roundRoles,
        setRoundRoles,
        currentRevealIndex,
        setCurrentRevealIndex,
        gamePhase,
        setGamePhase,
        impostors,
        setImpostors,
        currentQuestionPair,
        setCurrentQuestionPair,
        playerAnswers,
        setPlayerAnswers,
        currentAnswerIndex,
        setCurrentAnswerIndex,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
