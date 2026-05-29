import React, { createContext, useState, useCallback, use } from "react";
import { View, Pressable, type LayoutChangeEvent, GestureResponderEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type {
  SegmentedControlContextValue,
  SegmentedControlProps,
  SegmentedControlItemProps,
  SegmentedControlIndicatorProps,
  ItemMeasurements,
} from "./types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

const SegmentedControlContext = createContext<SegmentedControlContextValue>({
  value: "",
  onValueChange: () => {},
  measurements: {},
  setMeasurements: () => {},
});

// ------------------------------------------

const SegmentedControlRoot = ({
  value,
  onValueChange,
  className,
  children,
  style,
  ...props
}: SegmentedControlProps) => {
  const [measurements, setMeasurementsState] = useState<Record<string, ItemMeasurements>>({});

  const setMeasurements = useCallback((key: string, newMeasurements: ItemMeasurements) => {
    setMeasurementsState((prev) => ({ ...prev, [key]: newMeasurements }));
  }, []);

  const contextValue: SegmentedControlContextValue = {
    value,
    onValueChange,
    measurements,
    setMeasurements,
  };

  return (
    <SegmentedControlContext value={contextValue}>
      <View
        style={[{ flexDirection: "row" }, style]}
        className={cn("flex-row", className)}
        {...props}
      >
        {children}
      </View>
    </SegmentedControlContext>
  );
};

// ------------------------------------------

const SegmentedControlItem = ({
  value,
  className,
  onPress,
  style,
  ...props
}: SegmentedControlItemProps) => {
  const { onValueChange, setMeasurements, value: activeValue } = use(SegmentedControlContext);

  const isActive = activeValue === value;

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height, x } = event.nativeEvent.layout;
      setMeasurements(value, { width, height, x });
    },
    [value, setMeasurements]
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      onValueChange(value);
      // @ts-ignore
      onPress?.(event);
    },
    [value, onValueChange, onPress]
  );

  return (
    <AnimatedPressable
      className={className}
      style={style}
      onLayout={handleLayout}
      onPress={handlePress}
      accessibilityState={{ selected: isActive }}
      {...props}
    />
  );
};

// ------------------------------------------

const SegmentedControlIndicator = ({
  className,
  style,
  animationConfig = { type: "spring" },
  ...props
}: SegmentedControlIndicatorProps) => {
  const { value, measurements } = use(SegmentedControlContext);

  const activeMeasurements = measurements[value];
  const hasMeasured = useSharedValue(false);
  const reanimatedConfig = animationConfig?.config;

  const animatedStyle = useAnimatedStyle(() => {
    if (!activeMeasurements) {
      return { width: 0, height: 0, left: 0, opacity: 0 };
    }

    if (!hasMeasured.value) {
      hasMeasured.set(true);
      return {
        width: activeMeasurements.width,
        height: activeMeasurements.height,
        left: activeMeasurements.x,
        opacity: 1,
      };
    }

    return {
      width:
        animationConfig?.type === "timing"
          ? withTiming(activeMeasurements.width, reanimatedConfig)
          : withSpring(activeMeasurements.width, reanimatedConfig),
      height:
        animationConfig?.type === "timing"
          ? withTiming(activeMeasurements.height, reanimatedConfig)
          : withSpring(activeMeasurements.height, reanimatedConfig),
      left:
        animationConfig?.type === "timing"
          ? withTiming(activeMeasurements.x, reanimatedConfig)
          : withSpring(activeMeasurements.x, reanimatedConfig),
      opacity: 1,
    };
  }, [activeMeasurements]);

  return (
    <Animated.View
      className={cn("absolute", className)}
      style={[animatedStyle, style]}
      {...props}
    />
  );
};

// ------------------------------------------

SegmentedControlRoot.displayName = "SegmentedControl";
SegmentedControlItem.displayName = "SegmentedControl.Item";
SegmentedControlIndicator.displayName = "SegmentedControl.Indicator";

const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
  Indicator: SegmentedControlIndicator,
});

export default SegmentedControl;
