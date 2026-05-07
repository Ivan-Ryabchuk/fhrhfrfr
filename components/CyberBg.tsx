import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");
const LINES = 22;
const COLS_COUNT = 14;

const GLYPHS = "01アイウエオカキクケコABCDEFX#@!%&?<>{}[]".split("");
const PARTICLE_COUNT = 18;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function MatrixColumn({ x, delay }: { x: number; delay: number }) {
  const translateY = useRef(new Animated.Value(-height * 0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = randomBetween(3500, 7000);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: randomBetween(0.08, 0.25), duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: height * 1.1, duration, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -height * 0.3, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const glyphs = Array.from({ length: 10 }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);

  return (
    <Animated.View style={[{ position: "absolute", left: x, top: 0, transform: [{ translateY }], opacity }]}>
      {glyphs.map((g, i) => (
        <Text key={i} style={[styles.matrixGlyph, { opacity: 1 - i * 0.09 }]}>{g}</Text>
      ))}
    </Animated.View>
  );
}

function GlowParticle({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 6 }),
        ]),
        Animated.delay(randomBetween(800, 1800)),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.delay(randomBetween(1000, 3000)),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
      }}
    />
  );
}

function PulsingCorner({ position }: { position: "TL" | "TR" | "BL" | "BR" }) {
  const glow = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0.3, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const isTop = position.startsWith("T");
  const isLeft = position.endsWith("L");

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: isTop ? 0 : undefined,
        bottom: isTop ? undefined : 0,
        left: isLeft ? 0 : undefined,
        right: isLeft ? undefined : 0,
        width: 30,
        height: 30,
        borderTopWidth: isTop ? 1.5 : 0,
        borderBottomWidth: isTop ? 0 : 1.5,
        borderLeftWidth: isLeft ? 1.5 : 0,
        borderRightWidth: isLeft ? 0 : 1.5,
        borderColor: glow.interpolate({ inputRange: [0, 1], outputRange: ["rgba(0,255,255,0.2)", "rgba(0,255,255,0.9)"] }) as any,
      }}
    />
  );
}

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: randomBetween(0, width - 4),
  y: randomBetween(0, height - 4),
  delay: randomBetween(0, 4000),
  color: i % 3 === 0 ? "#00FFFF" : i % 3 === 1 ? "#FF00FF" : "#00FF41",
}));

const matrixColumns = Array.from({ length: 10 }, (_, i) => ({
  x: randomBetween(0, width - 20),
  delay: randomBetween(0, 5000),
}));

export default function CyberBg() {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const scan2Anim = useRef(new Animated.Value(1)).current;
  const glitchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 3200, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(1600),
        Animated.timing(scan2Anim, { toValue: 0, duration: 3200, useNativeDriver: true }),
        Animated.timing(scan2Anim, { toValue: 1, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(randomBetween(3000, 6000)),
        Animated.timing(glitchAnim, { toValue: 1, duration: 60, useNativeDriver: false }),
        Animated.timing(glitchAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
        Animated.timing(glitchAnim, { toValue: 0.5, duration: 40, useNativeDriver: false }),
        Animated.timing(glitchAnim, { toValue: 0, duration: 80, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const scan1Y = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-4, height + 4] });
  const scan2Y = scan2Anim.interpolate({ inputRange: [0, 1], outputRange: [-4, height + 4] });
  const glitchOpacity = glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.06] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: LINES }).map((_, i) => (
        <View key={`h${i}`} style={[styles.hLine, { top: (height / LINES) * i }]} />
      ))}
      {Array.from({ length: COLS_COUNT }).map((_, i) => (
        <View key={`v${i}`} style={[styles.vLine, { left: (width / COLS_COUNT) * i }]} />
      ))}

      {matrixColumns.map((col, i) => (
        <MatrixColumn key={`mc${i}`} x={col.x} delay={col.delay} />
      ))}

      {particles.map((p, i) => (
        <GlowParticle key={`p${i}`} x={p.x} y={p.y} delay={p.delay} color={p.color} />
      ))}

      <Animated.View style={[styles.scanLine, styles.scanCyan, { transform: [{ translateY: scan1Y }] }]} />
      <Animated.View style={[styles.scanLine, styles.scanMagenta, { transform: [{ translateY: scan2Y }] }]} />

      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,255,255,1)", opacity: glitchOpacity }]} />

      <PulsingCorner position="TL" />
      <PulsingCorner position="TR" />
      <PulsingCorner position="BL" />
      <PulsingCorner position="BR" />
    </View>
  );
}

const styles = StyleSheet.create({
  hLine: {
    position: "absolute", left: 0, right: 0, height: 1,
    backgroundColor: "rgba(0,255,255,0.035)",
  },
  vLine: {
    position: "absolute", top: 0, bottom: 0, width: 1,
    backgroundColor: "rgba(0,255,255,0.035)",
  },
  scanLine: {
    position: "absolute", left: 0, right: 0, height: 2,
  },
  scanCyan: {
    backgroundColor: "rgba(0,255,255,0.18)",
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  scanMagenta: {
    backgroundColor: "rgba(255,0,255,0.1)",
    shadowColor: "#FF00FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  matrixGlyph: {
    color: "#00FF41",
    fontSize: 11,
    fontFamily: "monospace",
    lineHeight: 14,
  },
});
