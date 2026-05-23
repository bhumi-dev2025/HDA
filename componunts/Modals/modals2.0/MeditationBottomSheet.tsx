import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import M1 from "../../../assets/2.0/model/M1.svg";
import { AppBottomSheet } from "./AppBottomSheet";

const buttonBg = require("../../../assets/2.0/model/button.png");

const MIN = 10;
const MAX = 60;
const STEP = 5;
const LABELS = ["10m", "20m", "30m", "40m", "50m", "60m"];
const THUMB_SIZE = 25;

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  initialValue?: string;
};

export function MeditationBottomSheet({
  isVisible,
  onClose,
  onSave,
  initialValue = "10",
}: Props) {
  const [value, setValue] = useState(parseInt(initialValue) || MIN);
  const [trackWidth, setTrackWidth] = useState(0);

  // Shared values — UI thread par run thay, no JS lag
  const thumbX = useSharedValue(0);
  const isPressed = useSharedValue(false);

  // trackWidth change thay tyare thumb position sync karo
  useEffect(() => {
    if (trackWidth > 0) {
      const progress = (value - MIN) / (MAX - MIN);
      thumbX.value = progress * (trackWidth - THUMB_SIZE);
    }
  }, [trackWidth]);

  // initialValue change thay tyare (modal reopen) sync karo
  useEffect(() => {
    const parsed = parseInt(initialValue) || MIN;
    setValue(parsed);
    if (trackWidth > 0) {
      const progress = (parsed - MIN) / (MAX - MIN);
      thumbX.value = withSpring(progress * (trackWidth - THUMB_SIZE), {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [initialValue]);

  // x position thi value calculate karo (JS side)
  const updateValueFromX = (x: number) => {
    if (trackWidth === 0) return;
    const usableWidth = trackWidth - THUMB_SIZE;
    const clamped = Math.max(0, Math.min(x, usableWidth));
    const raw = (clamped / usableWidth) * (MAX - MIN) + MIN;
    const stepped = Math.round(raw / STEP) * STEP;
    setValue(Math.max(MIN, Math.min(MAX, stepped)));
  };

  // Gesture — UI thread par, super smooth
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      isPressed.value = true;
      // Track thi direct tap karo tyare seedha jump karo
      const usableWidth = trackWidth - THUMB_SIZE;
      const tapX = e.x - THUMB_SIZE / 2;
      const clamped = Math.max(0, Math.min(tapX, usableWidth));
      thumbX.value = withSpring(clamped, { damping: 20, stiffness: 300 });
      startX.value = clamped;
      runOnJS(updateValueFromX)(clamped);
    })
    .onUpdate((e) => {
      const usableWidth = trackWidth - THUMB_SIZE;
      const newX = Math.max(
        0,
        Math.min(startX.value + e.translationX, usableWidth),
      );
      thumbX.value = newX;
      runOnJS(updateValueFromX)(newX);
    })
    .onFinalize(() => {
      isPressed.value = false;
      // Final snap to exact step position
      const usableWidth = trackWidth - THUMB_SIZE;
      const progress = (value - MIN) / (MAX - MIN);
      thumbX.value = withSpring(progress * usableWidth, {
        damping: 18,
        stiffness: 250,
      });
    });

  // Thumb animated style
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: thumbX.value },
      {
        scale: withSpring(isPressed.value ? 1.25 : 1, {
          damping: 12,
          stiffness: 300,
        }),
      },
    ],
  }));

  const handleSave = () => {
    onSave(`${value}`);
    onClose();
  };

  return (
    <AppBottomSheet isVisible={isVisible} onClose={onClose}>
      <View style={styles.container}>
        <M1 width={100} height={100} />

        <Text style={styles.title}>Meditation</Text>

        <Text style={styles.desc}>
          Monitor your meditation sessions to gain deeper insights into your
          mindfulness journey.
        </Text>

        {/* Value display */}
        {/* <View style={styles.valueWrap}>
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.valueUnit}>min</Text>
        </View> */}

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <GestureDetector gesture={panGesture}>
            <View
              style={styles.trackWrap}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            >
              {/* Background track */}
              <LinearGradient
                colors={["#FF5700", "#FFF600", "#3DFFC2", "#054DE8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.track}
              />

              {/* Thumb */}
              <Animated.View style={[styles.thumb, thumbStyle]} />
            </View>
          </GestureDetector>

          {/* Labels */}
          <View style={styles.labelsRow}>
            {LABELS.map((l) => (
              <View key={l} style={styles.labelCol}>
                <View style={styles.tick} />
                <Text style={styles.labelText}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          style={styles.btnWrap}
        >
          <ImageBackground
            source={buttonBg}
            style={styles.btn}
            imageStyle={{ borderRadius: 18 }}
            resizeMode="cover"
          >
            <Text style={styles.btnText}>Save</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 4,
    marginTop: 16,
  },
  desc: {
    color: "#8E8E93",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  valueText: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "800",
    lineHeight: 52,
  },
  valueUnit: {
    color: "#8E8E93",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 6,
  },
  sliderContainer: {
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  trackWrap: {
    height: 44,
    justifyContent: "center",
    position: "relative",
    marginTop: 8,
  },
  track: {
    width: "100%",
    height: 20,
    borderRadius: 20,
  },
  thumb: {
    position: "absolute",
    width: 10,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    top: (44 - THUMB_SIZE) / 2,
    left: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: 4,
  },
  labelCol: {
    alignItems: "center",
    gap: 3,
    marginBottom: 20,
  },
  tick: {
    width: 1.5,
    height: 10,
    borderRadius: 1,
    backgroundColor: "#636366",
  },
  labelText: {
    color: "#636366",
    fontSize: 10,
  },
  btnWrap: {
    width: "100%",
    marginTop: 8,
  },
  btn: {
    width: "100%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    overflow: "hidden",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
