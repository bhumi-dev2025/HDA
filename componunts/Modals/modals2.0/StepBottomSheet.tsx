import {
  Blur,
  Canvas,
  Group,
  Paint,
  Paragraph,
  Skia,
} from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { Minus, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  LinearTransition,
  SharedValue,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AppBottomSheet } from "./AppBottomSheet";

import M5 from "../../../assets/2.0/model/M5.svg";
const buttonBg = require("../../../assets/2.0/model/button.png");

// ── Constants ─────────────────────────────────────────────────
const FONT_SIZE = 54;
const FONT_WEIGHT = 700;
const STEP = 100;
const MAX_STEPS = 20000;
const MIN_STEPS = 100;
const MAX_BLUR = Platform.OS === "ios" ? 7.5 : 5;
const TOTAL_DIGITS = MAX_STEPS.toString().length; // 5

const SP_SOFT = { damping: 18, stiffness: 200 };
const SP_BOUNCE = { damping: 12, stiffness: 250 };

type Dir = "increase" | "decrease" | "idle";
const toDigits = (n: number) =>
  n.toString().padStart(TOTAL_DIGITS, "0").split("").map(Number);

// ── AnimatedDigit ─────────────────────────────────────────────
const AnimatedDigit = ({
  index,
  digitWidth,
  cur,
  prev,
  dir,
}: {
  index: number;
  digitWidth: number;
  cur: SharedValue<number>;
  prev: SharedValue<number>;
  dir: SharedValue<Dir>;
}) => {
  const para = useMemo(
    () =>
      Skia.ParagraphBuilder.Make()
        .pushStyle({
          color: Skia.Color("white"),
          fontSize: FONT_SIZE,
          fontStyle: { weight: FONT_WEIGHT },
        })
        .addText(index.toString())
        .build(),
    [index],
  );

  const progress = useDerivedValue(() => {
    if (cur.get() === index)
      return withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, SP_BOUNCE),
      );
    if (prev.get() === index) return withSpring(0, SP_BOUNCE);
    return 0;
  });

  const blurVal = useDerivedValue(() =>
    dir.get() === "idle"
      ? 0
      : interpolate(progress.get(), [0, 1], [MAX_BLUR, 0], Extrapolation.CLAMP),
  );

  return (
    <Canvas style={{ flex: 1 }}>
      <Group
        layer={
          <Paint>
            <Blur blur={blurVal} />
          </Paint>
        }
      >
        <Paragraph
          paragraph={para}
          x={0}
          y={FONT_SIZE * 0.05}
          width={digitWidth}
        />
      </Group>
    </Canvas>
  );
};

// ── DigitContainer ────────────────────────────────────────────
const DigitContainer = ({
  children,
  index,
  cur,
  prev,
  dir,
  digitWidth,
}: React.PropsWithChildren<{
  index: number;
  cur: SharedValue<number>;
  prev: SharedValue<number>;
  dir: SharedValue<Dir>;
  digitWidth: number;
}>) => {
  const dist = FONT_SIZE / 1.75;
  const ANGLE = 30;

  const opacity = useDerivedValue(() => {
    if (cur.get() === index) return withSpring(1, SP_BOUNCE);
    if (prev.get() === index) return withSpring(0, SP_BOUNCE);
    return 0;
  });

  const translateY = useDerivedValue(() => {
    const d = dir.get();
    if (cur.get() === index) {
      if (d === "increase")
        return withSequence(
          withTiming(dist, { duration: 0 }),
          withSpring(0, SP_SOFT),
        );
      if (d === "decrease")
        return withSequence(
          withTiming(-dist, { duration: 0 }),
          withSpring(0, SP_SOFT),
        );
    }
    if (prev.get() === index) {
      if (d === "increase") return withSpring(-dist, SP_SOFT);
      if (d === "decrease") return withSpring(dist, SP_SOFT);
    }
    return d === "idle"
      ? withSpring(0, SP_SOFT)
      : d === "increase"
        ? dist
        : -dist;
  });

  const angle = useDerivedValue(() => {
    const d = dir.get();
    if (cur.get() === index) {
      if (d === "increase")
        return withSequence(
          withTiming(360 - ANGLE, { duration: 0 }),
          withSpring(360, SP_SOFT),
        );
      if (d === "decrease")
        return withSequence(
          withTiming(ANGLE, { duration: 0 }),
          withSpring(0, SP_SOFT),
        );
    }
    if (prev.get() === index) {
      if (d === "increase")
        return withSequence(
          withTiming(0, { duration: 0 }),
          withSpring(ANGLE, SP_SOFT),
        );
      if (d === "decrease")
        return withSequence(
          withTiming(360, { duration: 0 }),
          withSpring(360 - ANGLE, SP_SOFT),
        );
    }
    return 0;
  });

  const scaleP = useDerivedValue(() => {
    if (cur.get() === index)
      return withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, SP_BOUNCE),
      );
    if (prev.get() === index) return withSpring(0, SP_BOUNCE);
    return 0;
  });

  const rStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { perspective: 500 },
      { translateY: translateY.get() },
      { rotateX: `${angle.get()}deg` },
      {
        scale:
          dir.get() === "idle"
            ? 1
            : interpolate(scaleP.get(), [0, 1], [0.5, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        rStyle,
        { height: FONT_SIZE, width: digitWidth },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ── DigitalWheel ──────────────────────────────────────────────
const DigitalWheel = ({
  wheelIndex,
  curDigits,
  prevDigits,
  direction,
  counter,
}: {
  wheelIndex: number;
  curDigits: SharedValue<number[]>;
  prevDigits: SharedValue<number[]>;
  direction: SharedValue<Dir>;
  counter: SharedValue<number>;
}) => {
  const [widths, setWidths] = useState<number[]>([]);
  const cur = useSharedValue(0);
  const prev = useSharedValue(0);
  const wDir = useSharedValue<Dir>("idle");

  useAnimatedReaction(
    () => curDigits.get(),
    (digits) => {
      const newCur = digits[wheelIndex] ?? 0;
      const newPrev = prevDigits.get()[wheelIndex] ?? 0;
      prev.set(newPrev);
      cur.set(newCur);
      wDir.set(newCur !== newPrev ? direction.get() : "idle");
    },
  );

  const maxW = widths.length ? Math.max(...widths) : 0;

  // simple: hide leading-zero wheels, no gap
  const rWrap = useAnimatedStyle(() => {
    const len = counter.get().toString().length;
    const leadingZeros = TOTAL_DIGITS - len;
    if (wheelIndex < leadingZeros)
      return { opacity: 0, width: 0, marginRight: 0 };
    return {
      opacity: 1,
      width: maxW,
      marginRight: 0,
    };
  });

  return (
    <>
      <Animated.View
        layout={LinearTransition.springify()}
        style={[
          rWrap,
          { height: FONT_SIZE, alignItems: "center", justifyContent: "center" },
        ]}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <DigitContainer
            key={i}
            index={i}
            cur={cur}
            prev={prev}
            dir={wDir}
            digitWidth={widths[i] ?? 0}
          >
            <AnimatedDigit
              index={i}
              digitWidth={widths[i] ?? 0}
              cur={cur}
              prev={prev}
              dir={wDir}
            />
          </DigitContainer>
        ))}
      </Animated.View>

      {Array.from({ length: 10 }, (_, i) => (
        <Text
          key={i}
          style={{
            position: "absolute",
            opacity: 0,
            color: "white",
            fontSize: FONT_SIZE,
            fontWeight: String(FONT_WEIGHT) as any,
          }}
          onTextLayout={({ nativeEvent }) => {
            const w = Math.round(nativeEvent.lines[0]?.width ?? 0);
            setWidths((p) => {
              const u = [...p];
              u[i] = w;
              return u;
            });
          }}
          pointerEvents="none"
        >
          {i}
        </Text>
      ))}
    </>
  );
};

// ── CounterButton ─────────────────────────────────────────────
const CounterButton = ({
  onPress,
  icon,
}: {
  onPress: () => void;
  icon: React.ReactNode;
}) => {
  const p = useSharedValue(0);
  const oStyle = useAnimatedStyle(() => ({
    opacity: p.get(),
    transform: [
      { scale: interpolate(p.get(), [0, 1], [0.9, 1.05], Extrapolation.CLAMP) },
    ],
  }));
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => p.set(withTiming(1, { duration: 150 }))}
      onPressOut={() => p.set(withTiming(0, { duration: 150 }))}
      activeOpacity={1}
      style={s.ctrlBtn}
    >
      <Animated.View style={[StyleSheet.absoluteFill, s.ctrlOverlay, oStyle]} />
      {icon}
    </TouchableOpacity>
  );
};

// ── MAIN ──────────────────────────────────────────────────────
type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (steps: string) => void;
  initialValue?: string;
};

export function StepBottomSheet({
  isVisible,
  onClose,
  onSave,
  initialValue = "0",
}: Props) {
  const init = Math.min(
    MAX_STEPS,
    Math.max(MIN_STEPS, parseInt(initialValue) || MIN_STEPS),
  );
  const [steps, setSteps] = useState(init);

  const counter = useSharedValue(init);
  const direction = useSharedValue<Dir>("idle");
  const curDigits = useSharedValue<number[]>(toDigits(init));
  const prevDigits = useSharedValue<number[]>(toDigits(init));

  useEffect(() => {
    const v = Math.min(
      MAX_STEPS,
      Math.max(MIN_STEPS, parseInt(initialValue) || MIN_STEPS),
    );
    setSteps(v);
    counter.value = v;
    direction.value = "idle";
    curDigits.value = toDigits(v);
    prevDigits.value = toDigits(v);
  }, [initialValue]);

  const haptic = useCallback(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    [],
  );

  const update = useCallback(
    (newVal: number, d: Dir) => {
      const v = Math.min(MAX_STEPS, Math.max(MIN_STEPS, newVal));
      prevDigits.value = toDigits(steps);
      direction.value = d;
      curDigits.value = toDigits(v);
      counter.value = v;
      setSteps(v);
      haptic();
    },
    [steps],
  );

  const hint = "10,000 steps : A popular goal that can help keep your heart\nhealthy, control diabetes, and aid in weight loss.";

  return (
    <AppBottomSheet isVisible={isVisible} onClose={onClose}>
      <View style={s.container}>
        <View style={{ alignItems: "center", width: "100%" }}>
          <M5 width={100} height={100} />
        </View>
        <Text style={s.title}>Daily steps</Text>

        <View style={s.counterRow}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
            }}
          >
            {Array.from({ length: TOTAL_DIGITS }, (_, i) => (
              <DigitalWheel
                key={i}
                wheelIndex={i}
                curDigits={curDigits}
                prevDigits={prevDigits}
                direction={direction}
                counter={counter}
              />
            ))}
          </View>

          <View style={s.ctrlRow}>
            <CounterButton
              onPress={() => update(steps + STEP, "increase")}
              icon={<Plus size={20} color="#fff" />}
            />
            <View style={s.ctrlDivider} />
            <CounterButton
              onPress={() => update(steps - STEP, "decrease")}
              icon={<Minus size={20} color="#fff" />}
            />
          </View>
        </View>

        <Text style={s.hint}>{hint}</Text>

        <TouchableOpacity
          onPress={() => {
            onSave(steps.toString());
            onClose();
          }}
          activeOpacity={0.85}
          style={s.btnWrap}
        >
          <ImageBackground
            source={buttonBg}
            style={s.btn}
            imageStyle={{ borderRadius: 18 }}
            resizeMode="cover"
          >
            <Text style={s.btnTxt}>Save</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </AppBottomSheet>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 20,
    marginBottom: 16,
    width: "100%",
  },
  title: {
    color: "#EBEBF5CC",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    alignItems: "flex-start",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: FONT_SIZE + 8,
  },
  ctrlRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  ctrlBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ctrlOverlay: { borderRadius: 12, backgroundColor: "rgba(255,255,255,0.5)" },
  ctrlDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  hint: {
    color: "#8E8E93",
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.1,
    alignSelf: "flex-start",
  },
  btnWrap: { width: "100%", marginTop: 4 },
  btn: {
    width: "100%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    overflow: "hidden",
  },
  btnTxt: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
