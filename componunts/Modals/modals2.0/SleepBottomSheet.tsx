import {
    Canvas,
    Path,
    Skia,
    SweepGradient,
    vec,
} from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useSharedValue } from "react-native-reanimated";
import { AppBottomSheet } from "./AppBottomSheet";

import M31 from "../../../assets/2.0/model/M31.svg";
import M32 from "../../../assets/2.0/model/M32.svg";

const buttonBg = require("../../../assets/2.0/model/button.png");

const { width: SCREEN_W } = Dimensions.get("window");
const DIAL_SIZE = SCREEN_W * 0.78;
const CENTER = DIAL_SIZE / 2;
const RADIUS = CENTER - 28;
const STROKE = 22;
const THUMB_R = 20;
const CLOCK_NUMS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const toAngle = (hours: number, minutes: number) =>
  ((hours % 12) + minutes / 60) * 30;

const fromAngle = (angle: number) => {
  const normalized = ((angle % 360) + 360) % 360;
  const totalMins = Math.round(((normalized / 360) * 12 * 60) / 5) * 5;
  return { hours: Math.floor(totalMins / 60) % 12, minutes: totalMins % 60 };
};

const angleDiff = (start: number, end: number) =>
  (((end - start) % 360) + 360) % 360;

const fmtTime = (h: number, m: number, ampm: "AM" | "PM") => {
  const hh = h === 0 ? 12 : h;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
};

const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const polar = (angleDeg: number, r: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
};

const makeArcPath = (startAngle: number, sweepAngle: number, r: number) => {
  const rect = { x: CENTER - r, y: CENTER - r, width: r * 2, height: r * 2 };
  return Skia.PathBuilder.Make()
    .addArc(rect, startAngle - 90, Math.min(sweepAngle, 359.9))
    .build();
};

const makeTicksPath = () => {
  const builder = Skia.PathBuilder.Make();
  for (let i = 0; i < 60; i++) {
    const angle   = (i * 6 - 90) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const outerR  = RADIUS - STROKE / 2 - 2;
    const innerR  = outerR - (isMajor ? 10 : 5);
    builder.moveTo(CENTER + outerR * Math.cos(angle), CENTER + outerR * Math.sin(angle));
    builder.lineTo(CENTER + innerR * Math.cos(angle), CENTER + innerR * Math.sin(angle));
  }
  return builder.build();
};

const getAngleFromTouch = (x: number, y: number) => {
  "worklet";
  const dx = x - CENTER;
  const dy = y - CENTER;
  const a = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return ((a % 360) + 360) % 360;
};

const snapToStep = (a: number) => {
  "worklet";
  const step = 360 / (12 * 12);
  return Math.round(a / step) * step;
};

type SleepData = { hours: number; minutes: number; bedH?: number; bedM?: number; wakeH?: number; wakeM?: number };
type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (v: SleepData) => void;
  initialValue?: SleepData;
};

export function SleepBottomSheet({
  isVisible,
  onClose,
  onSave,
  initialValue,
}: Props) {
  const [sleepAngle, setSleepAngle] = useState(toAngle(0, 0));
  const [wakeAngle, setWakeAngle] = useState(toAngle(6, 30));

  const svSleep = useSharedValue(toAngle(0, 0));
  const svWake = useSharedValue(toAngle(6, 30));
  const dragging = useSharedValue<number>(-1);

  // initialValue thi exact angles restore karo
  useEffect(() => {
    if (!initialValue) return;
    // bedH/wakeH saved hoy toh exact restore karo
    if (initialValue.bedH !== undefined && initialValue.wakeH !== undefined) {
      const sAngle = toAngle(initialValue.bedH % 12, initialValue.bedM ?? 0);
      const wAngle = toAngle(initialValue.wakeH % 12, initialValue.wakeM ?? 0);
      setSleepAngle(sAngle);
      svSleep.value = sAngle;
      setWakeAngle(wAngle);
      svWake.value = wAngle;
    }
  }, [initialValue]);

  const jsSleep = (a: number) => {
    setSleepAngle(a);
    svSleep.value = a;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const jsWake = (a: number) => {
    setWakeAngle(a);
    svWake.value = a;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      "worklet";
      const a = getAngleFromTouch(e.x, e.y);
      const dS = Math.min(
        Math.abs(a - svSleep.value),
        360 - Math.abs(a - svSleep.value),
      );
      const dW = Math.min(
        Math.abs(a - svWake.value),
        360 - Math.abs(a - svWake.value),
      );
      dragging.value = dS <= dW ? 0 : 1;
      const snapped = snapToStep(a);
      if (dragging.value === 0) runOnJS(jsSleep)(snapped);
      else runOnJS(jsWake)(snapped);
    })
    .onUpdate((e) => {
      "worklet";
      const snapped = snapToStep(getAngleFromTouch(e.x, e.y));
      if (dragging.value === 0) runOnJS(jsSleep)(snapped);
      else runOnJS(jsWake)(snapped);
    })
    .onFinalize(() => {
      "worklet";
      dragging.value = -1;
    });

  const sweep = angleDiff(sleepAngle, wakeAngle);
  const durationMins = Math.round(((sweep / 360) * 12 * 60) / 5) * 5;
  const sleepInfo = fromAngle(sleepAngle);
  const wakeInfo = fromAngle(wakeAngle);
  const durationStr = fmtDuration(durationMins);

  const bgPath    = makeArcPath(0, 359.9, RADIUS);
  const arcPath   = makeArcPath(sleepAngle, sweep, RADIUS);
  const ticksPath = makeTicksPath();
  const sleepPt   = polar(sleepAngle, RADIUS);
  const wakePt    = polar(wakeAngle,  RADIUS);

  const handleSave = () => {
    const h = Math.floor(durationMins / 60);
    const m = durationMins % 60;
    // Exact bedtime + wakeup angles thi hours calculate karo
    const bed = fromAngle(sleepAngle);
    const wake = fromAngle(wakeAngle);
    onSave({
      hours: h,
      minutes: m,
      bedH: bed.hours,
      bedM: bed.minutes,
      wakeH: wake.hours,
      wakeM: wake.minutes,
    });
    onClose();
  };

  return (
    <AppBottomSheet isVisible={isVisible} onClose={onClose}>
      <View style={s.container}>
        <Text style={s.title}>Add manual sleep</Text>

        <GestureDetector gesture={gesture}>
          <Animated.View style={s.dialWrap}>
            <Canvas style={s.canvas}>
              <Path path={bgPath} style="stroke" strokeWidth={STROKE} color="rgba(255,255,255,0.08)" strokeCap="butt" />
              {/* Tick marks */}
              <Path path={ticksPath} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.35)" strokeCap="round" />
              <Path path={arcPath} style="stroke" strokeWidth={STROKE} strokeCap="round">
                <SweepGradient c={vec(CENTER, CENTER)} colors={["#F57723", "#FFD633", "#FFD633", "#F57723"]} />
              </Path>
            </Canvas>

            {CLOCK_NUMS.map((num, i) => {
              const pt = polar(i * 30, RADIUS - STROKE - 16);
              return (
                <Text key={num} style={[s.clockNum, { left: pt.x - 12, top: pt.y - 10 }]}>
                  {num}
                </Text>
              );
            })}

            <View style={s.centerInfo}>
              <Text style={s.durationText}>{durationStr}</Text>
            </View>

            <View
              style={[
                s.thumb,
                { left: sleepPt.x - THUMB_R, top: sleepPt.y - THUMB_R },
              ]}
            >
              <M31 width={THUMB_R * 2} height={THUMB_R * 2} />
            </View>

            <View
              style={[
                s.thumb,
                { left: wakePt.x - THUMB_R, top: wakePt.y - THUMB_R },
              ]}
            >
              <M32 width={THUMB_R * 2} height={THUMB_R * 2} />
            </View>
          </Animated.View>
        </GestureDetector>

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

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    gap: 20,
    marginBottom: 16,
  },
  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 4,
  },
  dialWrap: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: { position: "absolute", width: DIAL_SIZE, height: DIAL_SIZE },
  clockNum: {
    position: "absolute",
    width: 24,
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "500",
  },
  centerInfo: { alignItems: "center", justifyContent: "center" },
  durationText: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  thumb: {
    position: "absolute",
    width:  THUMB_R * 2,
    height: THUMB_R * 2,
    alignItems: "center",
    justifyContent: "center",
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
