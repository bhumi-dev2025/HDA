import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, withDelay, Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Ring({ progress, color, radius, strokeWidth, size, delay = 0 }: {
  progress: number; color: string; radius: number;
  strokeWidth: number; size: number; delay?: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const animProgress = useSharedValue(0);
  const center = size / 2;
  const isFirst = useRef(true);

  useEffect(() => {
    const target = Math.min(progress, 1);
    if (isFirst.current) {
      isFirst.current = false;
      animProgress.value = withDelay(delay, withTiming(target, {
        duration: 1200, easing: Easing.out(Easing.cubic),
      }));
    } else {
      animProgress.value = withTiming(target, { duration: 600, easing: Easing.out(Easing.cubic) });
    }
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animProgress.value),
  }));

  return (
    <G rotation="-90" origin={`${center}, ${center}`}>
      <Circle cx={center} cy={center} r={radius} stroke={color}
        strokeWidth={strokeWidth} strokeOpacity={0.18} fill="none" />
      <AnimatedCircle
        cx={center} cy={center} r={radius} stroke={color}
        strokeWidth={strokeWidth} fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        animatedProps={animatedProps}
        strokeLinecap="round"
      />
    </G>
  );
}

export function ActivityRings({ red, blue, green, score, size = 220 }: {
  red: number; blue: number; green: number; score: number; size?: number;
}) {
  const sw = 22;
  const gap = 8;
  const outerR = size / 2 - sw / 2 - 4;
  const midR   = outerR - sw - gap;
  const innerR = midR   - sw - gap;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Ring progress={red}   color="#FF375F" radius={outerR} strokeWidth={sw} size={size} delay={0}   />
        <Ring progress={blue}  color="#0A84FF" radius={midR}   strokeWidth={sw} size={size} delay={150} />
        <Ring progress={green} color="#30D158" radius={innerR} strokeWidth={sw} size={size} delay={300} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Text style={styles.score}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  score: { color: '#FFFFFF', fontSize: 42, fontWeight: '800', letterSpacing: -2 },
});
