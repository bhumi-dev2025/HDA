import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AppBottomSheet } from "./AppBottomSheet";

const buttonBg = require("../../../assets/2.0/model/button.png");
const m6 = require("../../../assets/2.0/model/m6.png");

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get("window");

const STEPPER_W = SCREEN_W * 0.22;
const ITEM_H = 40;
const SLIDER_W = SCREEN_W * 0.71;
const SLIDER_H = 40;

const RUBBER_SPRING = { damping: 60, stiffness: 900 };
const SPRING = { damping: 90, stiffness: 1200 };

// 0.5, 1.0, 1.5 ... 8.0  →  16 steps
const STEPS: number[] = Array.from({ length: 16 }, (_, i) =>
  parseFloat(((i + 1) * 0.5).toFixed(1)),
);
const STEP_W = SLIDER_W / STEPS.length;

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const fmt = (l: number) => `${l.toFixed(1)}ltr`;

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (liters: number) => void;
  initialValue?: number;
};

// ─────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────
export function WaterBottomSheet({
  isVisible,
  onClose,
  onSave,
  initialValue = 1.5,
}: Props) {
  const clampedInit = Math.min(Math.max(initialValue, 0.5), 8);
  const initIdx = Math.max(
    0,
    STEPS.findIndex((s) => s >= clampedInit),
  );

  const stepIdx = useSharedValue(initIdx);
  const progress = useSharedValue(initIdx * STEP_W);
  const lastIdx = useSharedValue(initIdx);
  const presentState = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const rbX = useSharedValue(0);
  const rbActive = useSharedValue(false);
  const rbOrigin = useSharedValue<"left" | "right">("left");

  const [label, setLabel] = useState(fmt(STEPS[initIdx]));
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  useEffect(() => {
    const clamped = Math.min(Math.max(initialValue, 0.5), 8);
    const idx = Math.max(
      0,
      STEPS.findIndex((s) => s >= clamped),
    );
    stepIdx.value = idx;
    progress.value = idx * STEP_W;
    lastIdx.value = idx;
    setLabel(fmt(STEPS[idx]));
  }, [initialValue]);

  const hapticLight = () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const hapticSoft = () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  const updateLabel = (idx: number) =>
    setLabel(fmt(STEPS[Math.max(0, Math.min(idx, STEPS.length - 1))]));

  const decrement = () => {
    const cur = stepIdx.get();
    if (cur <= 0) return;
    const next = cur - 1;
    stepIdx.set(next);
    progress.set(withSpring(next * STEP_W, { damping: 140, stiffness: 1600 }));
    lastIdx.set(next);
    updateLabel(next);
    hapticLight();
  };

  const increment = () => {
    const cur = stepIdx.get();
    if (cur >= STEPS.length - 1) return;
    const next = cur + 1;
    stepIdx.set(next);
    progress.set(withSpring(next * STEP_W, { damping: 140, stiffness: 1600 }));
    lastIdx.set(next);
    updateLabel(next);
    hapticLight();
  };

  const handleCenterTap = () => {
    const target = presentState.get() === 0 ? 1 : 0;
    presentState.set(withTiming(target, { duration: 180 }));
    setIsSliderOpen(target === 1);
    pressScale.set(
      withSequence(
        withTiming(0.92, { duration: 90 }),
        withSpring(1, { damping: 12, stiffness: 300 }),
      ),
    );
    hapticSoft();
  };

  const sliderGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      rbActive.set(true);
      rbX.set(e.x);
      const i = Math.max(
        1,
        Math.min(Math.ceil(e.x / STEP_W), STEPS.length - 1),
      );
      const p =
        i === STEPS.length - 1
          ? SLIDER_W
          : Math.max(0, Math.min(i * STEP_W, SLIDER_W));
      progress.set(p);
      stepIdx.set(i);
      lastIdx.set(i);
      runOnJS(updateLabel)(i);
      runOnJS(hapticLight)();
    })
    .onChange((e) => {
      rbX.set(e.x);
      rbOrigin.set(e.x > SLIDER_W / 2 ? "left" : "right");
      const i = Math.max(
        1,
        Math.min(Math.ceil(e.x / STEP_W), STEPS.length - 1),
      );
      if (i !== lastIdx.get()) {
        lastIdx.set(i);
        stepIdx.set(i);
        const p =
          i === STEPS.length - 1
            ? SLIDER_W
            : Math.max(0, Math.min(i * STEP_W, SLIDER_W));
        progress.set(p);
        runOnJS(updateLabel)(i);
        runOnJS(hapticLight)();
      }
    })
    .onFinalize(() => {
      rbActive.set(false);
      if (rbX.get() >= 0 && rbX.get() <= SLIDER_W) return;
      if (rbOrigin.get() === "left") {
        rbX.set(withSpring(SLIDER_W, RUBBER_SPRING, () => rbX.set(0)));
      } else {
        rbX.set(withSpring(0, RUBBER_SPRING));
      }
    });

  const aStepperBtn = useAnimatedStyle(() => ({
    opacity: withSpring(1 - presentState.get(), SPRING),
    pointerEvents: presentState.get() > 0.5 ? "none" : "auto",
  }));

  const aCenter = useAnimatedStyle(() => {
    const targetX = -presentState.get() * (ITEM_H + 22);
    const translateX = withSpring(targetX, SPRING);
    return { transform: [{ translateX }, { scale: pressScale.get() }] };
  });

  const aBlock = useAnimatedStyle(() => {
    const opacity = interpolate(presentState.get(), [0, 1], [1, 0]);
    const scale = withSpring(
      interpolate(presentState.get(), [0, 1], [1, 0.8]),
      SPRING,
    );
    return {
      pointerEvents: presentState.get() > 0.5 ? "none" : "auto",
      opacity,
      transform: [{ scale }],
    };
  });

  const aSlider = useAnimatedStyle(() => {
    const opacity = interpolate(
      presentState.get(),
      [0.8, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const scale = withSpring(
      interpolate(presentState.get(), [0, 1], [0.75, 1], Extrapolation.CLAMP),
      SPRING,
    );
    return {
      pointerEvents: presentState.get() > 0.5 ? "auto" : "none",
      opacity,
      transform: [{ scale }],
    };
  });

  const aProgress = useAnimatedStyle(() => ({
    width: withSpring(progress.get(), { damping: 140, stiffness: 1600 }),
  }));

  const MAX_STRETCH = 100 * 2.5 * 2.5;
  const aRbStretch = useAnimatedStyle(() => {
    const scaleX = interpolate(
      rbX.get(),
      [-MAX_STRETCH, 0, SLIDER_W, SLIDER_W + MAX_STRETCH],
      [2.5, 1, 1, 2.5],
      Extrapolation.CLAMP,
    );
    const scaleY = interpolate(
      rbX.get(),
      [-SLIDER_W * 0.1, 0, SLIDER_W, SLIDER_W * 1.1],
      [0.9, 1, 1, 0.9],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scaleY }, { scaleX }] };
  });

  const aRbActive = useAnimatedStyle(() => ({
    transform: [
      {
        scale: rbActive.get()
          ? withSpring(1.03, { duration: 600 })
          : withSpring(1, { duration: 1000, dampingRatio: 0.3 }),
      },
    ],
  }));

  const handleSave = () => {
    const liters =
      STEPS[Math.max(0, Math.min(stepIdx.get(), STEPS.length - 1))];
    onSave(liters);
    onClose();
  };

  return (
    <AppBottomSheet isVisible={isVisible} onClose={onClose}>
      <View style={s.container}>
        {/* <M6 width={100} height={100} /> */}
        <Image source={m6}></Image>
        <Text style={s.title}>Water</Text>
        <Text style={s.desc}>
          Track your daily water intake to stay hydrated and support your
          overall health and performance.
        </Text>

        {/* ── Liter Row ── */}
        <View style={s.timerRow}>
          <Animated.View style={aStepperBtn}>
            <TouchableOpacity
              onPress={decrement}
              activeOpacity={0.7}
              style={s.iconBtn}
            >
              <View style={s.stepperIcon}>
                <View style={s.minusBar} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={aCenter}>
            <Pressable onPress={handleCenterTap} style={s.centerBtn}>
              <Text style={s.centerTxt}>{label}</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={aStepperBtn}>
            <TouchableOpacity
              onPress={increment}
              activeOpacity={0.7}
              style={s.iconBtn}
            >
              <View style={s.stepperIcon}>
                <View style={s.minusBar} />
                <View style={s.plusBar} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[s.blockArea, aBlock]}>
            <View style={s.blockInner}>
              <Text style={s.blockTxt}>Slide</Text>
              <View style={s.blockDots}>
                <View style={s.dot} />
                <View style={s.dot} />
                <View style={s.dot} />
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[s.sliderPos, aSlider]}>
            <GestureDetector gesture={sliderGesture}>
              <Animated.View
                style={[{ width: SLIDER_W, height: SLIDER_H }, aRbActive]}
              >
                <Animated.View style={[{ flex: 1 }, aRbStretch]}>
                  <View style={s.track}>
                    <View style={s.ticks}>
                      {STEPS.map((_, i) => (
                        <View key={i} style={s.tickWrap}>
                          <View
                            style={[
                              s.tick,
                              i === 0
                                ? { opacity: 0 }
                                : i % 2 === 0
                                  ? { height: "100%" }
                                  : { height: "50%", opacity: 0.6 },
                            ]}
                          />
                        </View>
                      ))}
                    </View>
                    <Animated.View style={[s.fill, aProgress]} />
                  </View>
                </Animated.View>
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
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

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    gap: 20,
    marginBottom: 16,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop: 8,
  },
  desc: {
    color: "#8E8E93",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: ITEM_H + 4,
    marginBottom: 16,
    marginTop: 16,
  },
  iconBtn: { alignItems: "center", justifyContent: "center" },
  stepperIcon: {
    width: ITEM_H,
    height: ITEM_H,
    borderRadius: ITEM_H / 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  minusBar: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFF",
  },
  plusBar: {
    position: "absolute",
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: "#FFF",
  },
  centerBtn: {
    width: STEPPER_W,
    height: ITEM_H,
    borderRadius: 16,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  centerTxt: { color: "#000", fontSize: 16, fontWeight: "600" },
  blockArea: { flex: 1, height: ITEM_H },
  blockInner: {
    flex: 1,
    flexDirection: "row",
    height: ITEM_H,
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: ITEM_H / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  blockTxt: { color: "#FFF", fontSize: 16, alignSelf: "center" },
  blockDots: {
    flexDirection: "row",
    gap: 2,
    backgroundColor: "#FFF",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#222" },
  sliderPos: { position: "absolute", right: 0, alignSelf: "center" },
  track: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  ticks: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  tickWrap: { flex: 1, alignItems: "flex-start", justifyContent: "center" },
  tick: { width: 2, borderRadius: 1, backgroundColor: "rgba(255,255,255,0.5)" },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 16,
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
