import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef } from "react";
import { ImageBackground, Platform, Pressable, StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";

const modalBg = require("../../../assets/2.0/model/bg.png");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function BlurBackdrop({
  animatedIndex,
  close,
}: BottomSheetBackdropProps & { close: () => void }) {
  const rPressableStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        animatedIndex.value,
        [-1, 0],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });
  const animatedIntensity = useAnimatedProps(() => ({
    intensity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 28],
      Extrapolation.CLAMP,
    ),
  }));
  return (
    <AnimatedPressable
      style={[
        StyleSheet.absoluteFill,
        rPressableStyle,
        { backgroundColor: "rgba(0, 0, 0, 0.15)" },
      ]}
      onPress={close}
      pointerEvents="auto"
    >
      <AnimatedBlurView
        animatedProps={animatedIntensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
    </AnimatedPressable>
  );
}

type Props = {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  keyboardBehavior?: "extend" | "fillParent" | "interactive";
};

export function AppBottomSheet({
  isVisible,
  onClose,
  children,
  snapPoints,
  enableDynamicSizing = true,
  keyboardBehavior = "extend",
}: Props) {
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isVisible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [isVisible]);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    if (Platform.OS === "android") {
      return (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
          pressBehavior="close"
        />
      );
    }
    return <BlurBackdrop {...props} close={() => ref.current?.dismiss()} />;
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleStyle={styles.handleStyle}
      backgroundStyle={styles.backgroundStyle}
      onDismiss={onClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
    >
      <BottomSheetView style={styles.container}>
        <ImageBackground
          source={modalBg}
          resizeMode="cover"
          style={styles.bgImage}
          imageStyle={styles.bgImageStyle}
        >
          <Pressable style={styles.dragHandle} onPress={onClose} hitSlop={12} />
          {children}
        </ImageBackground>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handleStyle: {
    display: "none",
  },
  backgroundStyle: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  container: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  bgImageStyle: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
});
