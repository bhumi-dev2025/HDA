import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const { width: W, height: H } = Dimensions.get('window');

// ── Asset paths ──────────────────────────────────────────────
const IMG = {
  bg:     require('./assets/photo/login/2.0/home.png'),
  n1:     require('./assets/photo/login/2.0/n1.png'),
  n2:     require('./assets/photo/login/2.0/n2.png'),
  n3:     require('./assets/photo/login/2.0/n3.png'),
  n4:     require('./assets/photo/login/2.0/n4.png'),
  n5:     require('./assets/photo/login/2.0/n5.png'),
  n6:     require('./assets/photo/login/2.0/n6.png'),
  n7:     require('./assets/photo/login/2.0/n7.png'),
  n8:     require('./assets/photo/login/2.0/n8.png'),
  n9:     require('./assets/photo/login/2.0/n9.png'),
  btnBg:  require('./assets/photo/login/2.0/button-removebg-preview.png'),
};

// ── SVG path (center of each node as x,y on W×H canvas) ─────
// Nodes positioned as percentage of screen so it works on all phones
const CX = W / 2;       // center x
const CY = H * 0.44;    // center y (H logo)

// Node positions  [x, y]
const POS = {
  n1: [W * 0.14, H * 0.20],   // top-left   Build Career
  n2: [W * 0.34, H * 0.28],   // mid-left   (small icon)
  n3: [W * 0.44, H * 0.34],   // mid-center (small icon)
  n4: [W * 0.72, H * 0.24],   // top-right  Upskill
  n5: [W * 0.58, H * 0.32],   // right-mid  (small icon)
  n6: [W * 0.50, H * 0.60],   // bottom-mid (handshake)
  n7: [W * 0.14, H * 0.68],   // bot-left   Build Habits
  n8: [W * 0.76, H * 0.68],   // bot-right  Find Community
};

// Dashed path string connecting nodes → center → back
// M=moveto, L=lineto, Q=quadratic curve
const buildPath = () => {
  const [x1,y1] = POS.n1;
  const [x2,y2] = POS.n2;
  const [x3,y3] = POS.n3;
  const [x4,y4] = POS.n4;
  const [x5,y5] = POS.n5;
  const [x6,y6] = POS.n6;
  const [x7,y7] = POS.n7;
  const [x8,y8] = POS.n8;
  return (
    `M${x1},${y1} Q${x2},${y2} ${CX},${CY} ` +
    `Q${x3},${y3} ${x4},${y4} ` +
    `M${CX},${CY} Q${x5},${y5} ${x4},${y4} ` +
    `M${x7},${y7} Q${x6},${y6} ${CX},${CY} ` +
    `Q${x6},${y6} ${x8},${y8}`
  );
};

// ── Animated dot that travels along the path ────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function TravelDot({ progress }: { progress: Animated.Value }) {
  // We fake the travel using interpolated x,y from key waypoints
  const pts = [
    POS.n1, POS.n2, [CX, CY], POS.n3, POS.n4,
    [CX, CY], POS.n5, POS.n4,
    POS.n7, POS.n6, [CX, CY], POS.n6, POS.n8,
  ];
  const steps = pts.length - 1;

  const cx = progress.interpolate({
    inputRange:  pts.map((_, i) => i / steps),
    outputRange: pts.map(p => p[0]),
  });
  const cy = progress.interpolate({
    inputRange:  pts.map((_, i) => i / steps),
    outputRange: pts.map(p => p[1]),
  });

  return (
    <AnimatedCircle
      cx={cx as any}
      cy={cy as any}
      r={5}
      fill="white"
      opacity={0.9}
    />
  );
}

// ── Node card component ──────────────────────────────────────
function NodeCard({ img, label, pos, large = false }: {
  img: any; label?: string; pos: number[]; large?: boolean;
}) {
  const size = large ? 80 : 56;
  return (
    <View style={[
      styles.nodeWrap,
      { left: pos[0] - size / 2, top: pos[1] - size / 2 }
    ]}>
      <View style={[styles.nodeBox, { width: size, height: size, borderRadius: large ? 20 : 14 }]}>
        <Image source={img} style={{ width: size - 10, height: size - 10 }} resizeMode="contain" />
      </View>
      {label ? <Text style={styles.nodeLabel}>{label}</Text> : null}
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────
export default function LoginNew() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false, // cx/cy cannot use native driver
      })
    ).start();
  }, []);

  const handleGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      // Cache clear karo — jethhi account selection screen ave
      try { await GoogleSignin.revokeAccess(); } catch (_) {}
      try { await GoogleSignin.signOut(); } catch (_) {}

      const userInfo = await GoogleSignin.signIn();
      console.log('Google user:', userInfo);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ImageBackground source={IMG.bg} style={styles.container} resizeMode="cover">

      {/* ── SVG layer: dashed lines + animated dot ── */}
      <Svg
        width={W} height={H}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {/* Dashed path lines */}
        <Path
          d={buildPath()}
          stroke="#6a5acd"
          strokeWidth={1.5}
          strokeDasharray="6,5"
          fill="none"
          opacity={0.8}
        />
        {/* White travelling dot */}
        <TravelDot progress={progress} />
      </Svg>

      {/* ── Node icons ── */}
      <NodeCard img={IMG.n1} label="Build Career"    pos={POS.n1} />
      <NodeCard img={IMG.n2}                          pos={POS.n2} />
      <NodeCard img={IMG.n3}                          pos={POS.n3} />
      <NodeCard img={IMG.n4} label="Upskill Yourself" pos={POS.n4} />
      <NodeCard img={IMG.n5}                          pos={POS.n5} />
      <NodeCard img={IMG.n6}                          pos={POS.n6} />
      <NodeCard img={IMG.n7} label="Build Habits"    pos={POS.n7} />
      <NodeCard img={IMG.n8} label="Find Community"  pos={POS.n8} />

      {/* ── Center H logo ── */}
      <View style={[styles.centerLogo, { left: CX - 44, top: CY - 44 }]}>
        <Image source={IMG.n9} style={{ width: 78, height: 78 }} resizeMode="contain" />
      </View>

      {/* ── Bottom Buttons ── */}
      <View style={styles.btnArea}>
        <TouchableOpacity style={styles.btnGoogle} onPress={handleGoogle} activeOpacity={0.85}>
          <Image source={IMG.btnBg} style={styles.btnIcon} resizeMode="contain" />
          <Text style={styles.btnGoogleText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnApple} activeOpacity={0.85}>
          <Text style={styles.appleIcon}></Text>
          <Text style={styles.btnAppleText}>Sign in with Apple</Text>
        </TouchableOpacity>
      </View>

    </ImageBackground>
  );
}

// ── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  nodeWrap: {
    position: 'absolute',
    alignItems: 'center',
    gap: 5,
  },
  nodeBox: {
    backgroundColor: '#252525',
    borderWidth: 1.5,
    borderColor: '#383838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLabel: {
    color: '#d0d0d0',
    fontSize: 11,
    textAlign: 'center',
    backgroundColor: 'rgba(30,30,30,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  centerLogo: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnArea: {
    position: 'absolute',
    bottom: 48,
    left: 20,
    right: 20,
    gap: 12,
  },
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 30,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#444',
    gap: 10,
  },
  btnIcon: {
    width: 20,
    height: 20,
  },
  btnGoogleText: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '500',
  },
  btnApple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    paddingVertical: 15,
    gap: 10,
  },
  appleIcon: {
    fontSize: 18,
    color: '#000',
  },
  btnAppleText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
  },
});
