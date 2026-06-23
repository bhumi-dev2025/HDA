import * as Haptics from "expo-haptics";
import React, { FC, ReactNode, useEffect } from "react";
import { Pressable, Text, useWindowDimensions } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const BUTTON_SCALE_DURATION = 150;
const BUTTON_SCALE_PRESSED = 0.9;

// Design was built for a large phone (~430pt wide, e.g. big Android / Pro Max).
// On narrower screens (iPhone 15 Pro, small Android, etc.) we scale padding
// and font size down proportionally so the label never wraps/overflows.
const BASE_WIDTH = 430;
const MIN_SCALE = 0.72;

interface TabButtonProps {
  focused: boolean;
  onPress: () => void;
  children: ReactNode;
  label?: string;
}

export const TabButton: FC<TabButtonProps> = ({
  focused,
  onPress,
  children,
  label,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const scaleFactor = Math.max(MIN_SCALE, Math.min(1, screenWidth / BASE_WIDTH));

  const scale = useSharedValue(1);
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: BUTTON_SCALE_DURATION,
    });
  }, [focused]);

  const rStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withTiming(scale.value, { duration: BUTTON_SCALE_DURATION }) },
    ],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(255,255,255,0)", "rgba(255,255,255,0.2)"],
    ),
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withTiming(BUTTON_SCALE_PRESSED, {
          duration: BUTTON_SCALE_DURATION,
        });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: BUTTON_SCALE_DURATION });
      }}
    >
      <Animated.View
        style={[
          rStyle,
          {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8 * scaleFactor,
            paddingHorizontal: 14 * scaleFactor,
            borderRadius: 999,
            gap: 3 * scaleFactor,
          },
        ]}
      >
        {children}
        {label && (
          <Text
            numberOfLines={1}
            style={{
              color: focused ? "white" : "#8E8E93",
              fontSize: 11 * scaleFactor,
              fontWeight: focused ? "600" : "400",
              letterSpacing: 0,
            }}
          >
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};
