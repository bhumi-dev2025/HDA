import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const COLORS = ['#FF375F', '#0A84FF', '#30D158', '#FFD60A', '#BF5AF2', '#FF9F0A', '#FFFFFF'];

function rand(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rot: Animated.Value;
  opa: Animated.Value;
  color: string;
  w: number;
  h: number;
  startX: number;
  startY: number;
  maxDeg: number;
}

function makeParticles(type: 'mini' | 'big'): Particle[] {
  const n = type === 'mini' ? 38 : 100;
  return Array.from({ length: n }, (_, i) => {
    const w = rand(5, 11);
    const isRect = Math.random() > 0.45;
    const h = isRect ? w * rand(0.28, 0.55) : w;

    let sx: number, sy: number;
    if (type === 'mini') {
      const fromLeft = i % 2 === 0;
      sx = fromLeft ? rand(-15, 10) : rand(W - 10, W + 15);
      sy = rand(H * 0.22, H * 0.72);
    } else {
      sx = rand(0, W);
      sy = rand(-80, -5);
    }

    return {
      id: i,
      x: new Animated.Value(sx),
      y: new Animated.Value(sy),
      rot: new Animated.Value(0),
      opa: new Animated.Value(1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w, h,
      startX: sx,
      startY: sy,
      maxDeg: rand(240, 760) * (Math.random() > 0.5 ? 1 : -1),
    };
  });
}

function runParticles(ps: Particle[], type: 'mini' | 'big', onDone: () => void) {
  const anims = ps.map(p => {
    const delay = rand(0, type === 'mini' ? 70 : 500);

    if (type === 'mini') {
      const goRight = p.startX < W / 2;
      const tx = goRight ? p.startX + rand(130, 230) : p.startX - rand(130, 230);
      const peak = p.startY - rand(70, 170);
      const land = p.startY + rand(80, 210);
      const up = rand(340, 560);
      const dn = rand(480, 820);
      const tot = up + dn;

      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: tx, duration: tot, delay,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.y, {
            toValue: peak, duration: up, delay,
            easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: land, duration: dn,
            easing: Easing.in(Easing.quad), useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.rot, { toValue: 1, duration: tot, delay, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(delay + tot * 0.62),
          Animated.timing(p.opa, { toValue: 0, duration: tot * 0.38, useNativeDriver: true }),
        ]),
      ]);
    } else {
      const tx = p.startX + rand(-90, 90);
      const dur = rand(2000, 3600);

      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: tx, duration: dur, delay,
          easing: Easing.linear, useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: H + 70, duration: dur, delay,
          easing: Easing.in(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(p.rot, { toValue: 1, duration: dur, delay, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(delay + dur * 0.68),
          Animated.timing(p.opa, { toValue: 0, duration: dur * 0.32, useNativeDriver: true }),
        ]),
      ]);
    }
  });

  Animated.parallel(anims).start(onDone);
}

export function ConfettiOverlay({
  type,
  onComplete,
}: {
  type: 'mini' | 'big' | null;
  onComplete: () => void;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [active, setActive] = useState(false);
  const gen = useRef(0);

  useEffect(() => {
    if (!type) { setActive(false); return; }
    const g = ++gen.current;
    const ps = makeParticles(type);
    setParticles(ps);
    setActive(true);
    runParticles(ps, type, () => {
      if (gen.current !== g) return;
      setActive(false);
      onComplete();
    });
  }, [type]);

  if (!active || particles.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <Animated.View
          key={p.id}
          style={{
            position: 'absolute',
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: p.h === p.w ? p.w / 2 : 2,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              {
                rotate: p.rot.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${p.maxDeg}deg`],
                }),
              },
            ],
            opacity: p.opa,
          }}
        />
      ))}
    </View>
  );
}
