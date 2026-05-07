import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const PIXEL = 10;
const GAP = 2;

const DRAGON: number[][] = [
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,2,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1,3,3,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,3,3,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,3,3,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0,0,0,3,3,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0,3,3,0,0,0,0,0],
];

const COLS = {
  0: "transparent",
  1: "#00FFFF",
  2: "#FF00FF",
  3: "#FF0055",
};

type ColKey = keyof typeof COLS;

function PixelCell({ type, delay }: { type: number; delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (type === 0) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  if (type === 0) return <View style={styles.cellEmpty} />;

  const color = COLS[type as ColKey];
  return (
    <Animated.View
      style={[
        styles.cell,
        {
          backgroundColor: color,
          opacity: anim,
          shadowColor: color,
        },
      ]}
    />
  );
}

export default function PixelDragon({ scale = 1 }: { scale?: number }) {
  return (
    <View style={[styles.dragon, { transform: [{ scale }] }]}>
      {DRAGON.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((cell, ci) => (
            <PixelCell
              key={ci}
              type={cell}
              delay={((ri * 20 + ci) % 30) * 60}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dragon: { alignItems: "center" },
  row: { flexDirection: "row" },
  cell: {
    width: PIXEL,
    height: PIXEL,
    margin: GAP / 2,
    borderRadius: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
  cellEmpty: {
    width: PIXEL,
    height: PIXEL,
    margin: GAP / 2,
  },
});
