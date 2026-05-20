import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ImageBackground,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import M1 from "../../assets/2.0/model/M1.svg";
import { AppBottomSheet } from "../AppBottomSheet";

const buttonBg = require("../../assets/2.0/model/button.png");

const MIN = 10;
const MAX = 60;
const STEP = 5;
const LABELS = ["10m", "20m", "30m", "40m", "50m", "60m"];

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
  const [value, setValue] = useState(parseInt(initialValue) || 10);
  const [trackWidth, setTrackWidth] = useState(0);

  const progress = (value - MIN) / (MAX - MIN);
  const thumbLeft = progress * trackWidth;

  const handleSave = () => {
    onSave(`${value}`);
    onClose();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const x = e.nativeEvent.locationX;
      updateValue(x);
    },
    onPanResponderMove: (e) => {
      const x = e.nativeEvent.locationX;
      updateValue(x);
    },
  });

  const updateValue = (x: number) => {
    if (trackWidth === 0) return;
    const clamped = Math.max(0, Math.min(x, trackWidth));
    const raw = (clamped / trackWidth) * (MAX - MIN) + MIN;
    const stepped = Math.round(raw / STEP) * STEP;
    setValue(Math.max(MIN, Math.min(MAX, stepped)));
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <AppBottomSheet isVisible={isVisible} onClose={onClose}>
      <View style={styles.container}>
        {/* Icon */}
        {/* <View style={styles.iconWrap}> */}
        <M1 width={100} height={100} />
        {/* </View> */}

        {/* Title */}
        <Text style={styles.title}>Meditation</Text>

        {/* Description */}
        <Text style={styles.desc}>
          Monitor your meditation sessions to gain deeper insights into your
          mindfulness journey.
        </Text>

        {/* Custom Gradient Slider */}
        <View style={styles.sliderContainer} {...panResponder.panHandlers}>
          {/* Track */}
          <View style={styles.trackWrap} onLayout={onTrackLayout}>
            <LinearGradient
              colors={["#FF5700", "#FFF600", "#3DFFC2", "#054DE8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.track}
            />
            {/* Thumb */}
            <View
              style={[styles.thumb, { left: Math.max(0, thumbLeft - 11) }]}
            />
          </View>

          {/* Labels with ticks */}
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
  // iconWrap: {
  //   width: 72,
  //   height: 72,
  //   borderRadius: 20,
  //   backgroundColor: "#2C2C2E",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginBottom: 4,
  // },
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
  sliderContainer: {
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  trackWrap: {
    height: 36,
    justifyContent: "center",
    position: "relative",
    marginTop: 20,
  },
  track: {
    width: "100%",
    height: 20,
    borderRadius: 12,
  },
  thumb: {
    position: "absolute",
    width: 10,
    height: 20,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    top: 7,
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
