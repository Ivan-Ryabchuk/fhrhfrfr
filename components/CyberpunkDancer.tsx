import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";

// Color palette
const CYAN = "#00FFFF";
const MAGENTA = "#FF00FF";
const YELLOW = "#FFE600";
const WHITE = "#FFFFFF";
const GREEN = "#00FF41";

export default function CyberpunkDancer() {
  const glowCyan = useRef(new Animated.Value(0.4)).current;
  const glowMagenta = useRef(new Animated.Value(0.4)).current;
  const energyPulse = useRef(new Animated.Value(0)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cyan glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowCyan, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowCyan, { toValue: 0.4, duration: 1800, useNativeDriver: false }),
      ])
    ).start();

    // Magenta glow pulse (offset)
    Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(glowMagenta, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowMagenta, { toValue: 0.4, duration: 1800, useNativeDriver: false }),
      ])
    ).start();

    // Energy ring expansion
    Animated.loop(
      Animated.timing(energyPulse, { toValue: 1, duration: 2500, useNativeDriver: true })
    ).start();

    // Sparkle blink
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(sparkleOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.delay(400),
      ])
    ).start();
  }, []);

  const energyScale = energyPulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });

  return (
    <View style={styles.container}>
      {/* Pulsing energy rings */}
      <Animated.View style={{ transform: [{ scale: energyScale }], opacity: 0.2 }}>
        <Svg width={340} height={340} style={{ position: "absolute", left: 0, top: 20 }}>
          {/* Outer dashed ring */}
          <Circle cx={170} cy={170} r={150} fill="none" stroke={CYAN} strokeWidth={1.5} strokeDasharray="5 8" />
          {/* Middle ring */}
          <Circle cx={170} cy={170} r={110} fill="none" stroke={MAGENTA} strokeWidth={1} strokeDasharray="4 6" />
          {/* Inner ring */}
          <Circle cx={170} cy={170} r={75} fill="none" stroke={GREEN} strokeWidth={0.8} strokeDasharray="3 4" />
        </Svg>
      </Animated.View>

      {/* Main bird figure */}
      <Svg width={320} height={380} style={{ position: "absolute" }}>
        {/* Legs */}
        <Line x1={125} y1={290} x2={125} y2={330} stroke={CYAN} strokeWidth={3} strokeLinecap="round" />
        <Line x1={195} y1={290} x2={195} y2={330} stroke={MAGENTA} strokeWidth={3} strokeLinecap="round" />
        {/* Feet pads */}
        <Ellipse cx={125} cy={335} rx={10} ry={6} fill={CYAN} opacity={0.9} />
        <Ellipse cx={195} cy={335} rx={10} ry={6} fill={MAGENTA} opacity={0.9} />

        {/* Talons */}
        <Line x1={120} y1={335} x2={110} y2={345} stroke={CYAN} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={130} y1={335} x2={140} y2={345} stroke={CYAN} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={190} y1={335} x2={180} y2={345} stroke={MAGENTA} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={200} y1={335} x2={210} y2={345} stroke={MAGENTA} strokeWidth={1.5} strokeLinecap="round" />

        {/* Body ellipse */}
        <Ellipse cx={160} cy={230} rx={60} ry={85} fill="rgba(255,230,0,0.08)" stroke={YELLOW} strokeWidth={2.5} />

        {/* Feather pattern lines – left side */}
        <Path d="M 110 190 L 105 210 L 110 225" stroke={CYAN} strokeWidth={1.2} fill="none" opacity={0.5} strokeLinecap="round" />
        <Path d="M 120 185 L 115 210 L 120 235" stroke={CYAN} strokeWidth={1.2} fill="none" opacity={0.4} strokeLinecap="round" />
        {/* Feather pattern lines – right side */}
        <Path d="M 210 190 L 215 210 L 210 225" stroke={MAGENTA} strokeWidth={1.2} fill="none" opacity={0.5} strokeLinecap="round" />
        <Path d="M 200 185 L 205 210 L 200 235" stroke={MAGENTA} strokeWidth={1.2} fill="none" opacity={0.4} strokeLinecap="round" />

        {/* Left wing */}
        <Ellipse cx={105} cy={220} rx={28} ry={60} fill="rgba(0,255,255,0.06)" stroke={CYAN} strokeWidth={2} />
        <Path d="M 90 190 Q 85 220 95 260" stroke={CYAN} strokeWidth={1.5} fill="none" opacity={0.6} strokeLinecap="round" />
        <Path d="M 100 185 Q 92 220 105 265" stroke={CYAN} strokeWidth={1.5} fill="none" opacity={0.5} strokeLinecap="round" />
        <Path d="M 110 190 Q 105 225 115 260" stroke={CYAN} strokeWidth={1} fill="none" opacity={0.4} strokeLinecap="round" />

        {/* Right wing */}
        <Ellipse cx={215} cy={220} rx={28} ry={60} fill="rgba(255,0,255,0.06)" stroke={MAGENTA} strokeWidth={2} />
        <Path d="M 230 190 Q 235 220 225 260" stroke={MAGENTA} strokeWidth={1.5} fill="none" opacity={0.6} strokeLinecap="round" />
        <Path d="M 220 185 Q 228 220 215 265" stroke={MAGENTA} strokeWidth={1.5} fill="none" opacity={0.5} strokeLinecap="round" />
        <Path d="M 210 190 Q 215 225 205 260" stroke={MAGENTA} strokeWidth={1} fill="none" opacity={0.4} strokeLinecap="round" />

        {/* Tail feathers */}
        <Path d="M 160 310 Q 185 280 195 230" stroke={YELLOW} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d="M 160 310 Q 135 280 125 230" stroke={YELLOW} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d="M 160 310 Q 160 270 165 210" stroke={WHITE} strokeWidth={2} fill="none" opacity={0.7} strokeLinecap="round" />
        <Path d="M 160 310 Q 170 270 175 210" stroke={GREEN} strokeWidth={1.5} fill="none" opacity={0.5} strokeLinecap="round" />

        {/* Neck */}
        <Line x1={160} y1={145} x2={160} y2={195} stroke={YELLOW} strokeWidth={4} strokeLinecap="round" />
        <Ellipse cx={160} cy={150} rx={8} ry={10} fill={YELLOW} opacity={0.8} />

        {/* Head */}
        <Circle cx={160} cy={115} r={32} fill="rgba(255,230,0,0.1)" stroke={YELLOW} strokeWidth={2.5} />

        {/* Beak */}
        <Polygon points="195,115 220,108 195,122" fill={MAGENTA} stroke={MAGENTA} strokeWidth={1.5} />
        <Line x1={220} y1={108} x2={230} y2={105} stroke={MAGENTA} strokeWidth={1} opacity={0.6} strokeLinecap="round" />

        {/* Eye */}
        <Circle cx={175} cy={108} r={6} fill={CYAN} />
        <Circle cx={177} cy={106} r={3} fill="#000" />
        <Circle cx={178} cy={104} r={1.5} fill={WHITE} />

        {/* Crest feathers */}
        <Polygon points="152,85 155,70 158,85 155,88" fill={MAGENTA} stroke={MAGENTA} strokeWidth={1.5} />
        <Polygon points="160,82 163,65 166,82 163,86" fill={MAGENTA} stroke={MAGENTA} strokeWidth={1.5} />
        <Polygon points="168,85 171,70 174,85 171,88" fill={MAGENTA} stroke={MAGENTA} strokeWidth={1.5} />

        {/* Neon aura rings */}
        <Circle cx={160} cy={230} r={65} fill="none" stroke={CYAN} strokeWidth={1} opacity={0.3} />
        <Circle cx={160} cy={230} r={80} fill="none" stroke={MAGENTA} strokeWidth={0.8} opacity={0.2} />
        <Circle cx={160} cy={230} r={90} fill="none" stroke={YELLOW} strokeWidth={0.6} opacity={0.15} />

        {/* DEV badge – top left corner */}
        <Rect x={10} y={10} width={52} height={20} rx={3} fill="none" stroke={CYAN} strokeWidth={1} opacity={0.6} />
        <SvgText x={36} y={24} textAnchor="middle" fill={CYAN} fontSize={9} fontWeight="bold" letterSpacing={2} opacity={0.9}>
          DEV
        </SvgText>

        {/* RYABCHUK label – bottom right corner */}
        <Rect x={210} y={350} width={100} height={18} rx={3} fill="none" stroke={MAGENTA} strokeWidth={0.8} opacity={0.5} />
        <SvgText x={260} y={363} textAnchor="middle" fill={MAGENTA} fontSize={8} fontWeight="bold" letterSpacing={2} opacity={0.8}>
          RYABCHUK
        </SvgText>
      </Svg>

      {/* Sparkle top-left */}
      <Animated.View style={{ position: "absolute", left: 80, top: 40, opacity: sparkleOpacity }}>
        <Svg width={30} height={30}>
          <Circle cx={15} cy={15} r={3} fill={CYAN} />
          <Line x1={15} y1={5} x2={15} y2={25} stroke={CYAN} strokeWidth={1} opacity={0.6} />
          <Line x1={5} y1={15} x2={25} y2={15} stroke={CYAN} strokeWidth={1} opacity={0.6} />
        </Svg>
      </Animated.View>

      {/* Sparkle bottom-right */}
      <Animated.View style={{ position: "absolute", right: 70, bottom: 80, opacity: sparkleOpacity }}>
        <Svg width={25} height={25}>
          <Circle cx={12.5} cy={12.5} r={2.5} fill={MAGENTA} />
          <Line x1={12.5} y1={3} x2={12.5} y2={22} stroke={MAGENTA} strokeWidth={1} opacity={0.6} />
          <Line x1={3} y1={12.5} x2={22} y2={12.5} stroke={MAGENTA} strokeWidth={1} opacity={0.6} />
        </Svg>
      </Animated.View>

      {/* Branding labels */}
      <View style={styles.textBox}>
        <Animated.Text style={[styles.namePart, { color: CYAN, opacity: glowCyan }]}>
          RYABCHUK
        </Animated.Text>
        <Animated.Text style={styles.separator}>◆</Animated.Text>
        <Animated.Text style={[styles.namePart, { color: MAGENTA, opacity: glowMagenta }]}>
          DEV
        </Animated.Text>
        <Animated.Text style={styles.tagline}>
          {"// INDIE GAME STUDIO //"}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 420,
    alignSelf: "center",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  textBox: {
    position: "absolute",
    bottom: 18,
    alignItems: "center",
    gap: 4,
  },
  namePart: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 4,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
    textShadowColor: "#00FFFF",
  },
  separator: {
    color: YELLOW,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
  },
  tagline: {
    color: WHITE,
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 2,
    marginTop: 2,
    opacity: 0.55,
  },
});
