import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { 
  Canvas, 
  Circle, 
  RadialGradient, 
  vec, 
  DashPathEffect 
} from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';
import I5 from '../assets/photo/home/I5.svg'

const { width } = Dimensions.get('window');
const SIZE = width * 0.7;
const CENTER = SIZE / 2;
const INNER_CIRCLE_RADIUS = SIZE * 0.28;

const DOT_COLORS = ['#A32CC4', '#8DB600', '#D4AF37', '#1FB1C1'];
const DOT_COUNT = 60;

interface ScoreChartProps {
  score?: number;
}

export default function ScoreChart({ score = 71 }: ScoreChartProps) {
  // એનિમેશન માટે Reanimated Value
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(2 * Math.PI, { duration: 20000 }), 
      -1, 
      false
    );
  }, []);

  // ટપકાંઓ રેન્ડર કરવાનું ફંક્શન
  const renderDots = () => {
    let dots = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      const baseAngle = (i * 360) / DOT_COUNT;
      const radians = (baseAngle * Math.PI) / 180;
      
      const distance = i % 2 === 0 ? SIZE * 0.30 : SIZE * 0.35;
      const dotRadius = Math.random() * 3 + 2; 
      
      const x = CENTER + distance * Math.cos(radians);
      const y = CENTER + distance * Math.sin(radians);
      const color = DOT_COLORS[i % DOT_COLORS.length];

      dots.push(
        <Circle key={i} cx={x} cy={y} r={dotRadius} color={color} opacity={0.8} />
      );
    }
    return dots;
  };

  return (
    <View className="items-center justify-center bg-transparent">
      <Canvas style={{ width: SIZE, height: SIZE }}>
        {/* સેન્ટર ગ્લો */}
        <Circle cx={CENTER} cy={CENTER} r={INNER_CIRCLE_RADIUS * 1.5}>
          <RadialGradient 
            c={vec(CENTER, CENTER)} 
            r={INNER_CIRCLE_RADIUS * 1.5} 
            colors={['#f5fce8', 'rgba(255,255,255,0)']} 
          />
        </Circle>
        
        {/* Dashed Circle Fix */}
        <Circle 
          cx={CENTER} cy={CENTER} r={INNER_CIRCLE_RADIUS * 0.9} 
          style="stroke" 
          strokeWidth={1} 
          color="#E5E6E5"
        >
          <DashPathEffect intervals={[5, 5]} />
        </Circle>

        {renderDots()}
      </Canvas>

      {/* સેન્ટર ટેક્સ્ટ Overlay */}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <View className="flex-row items-baseline">
          <Text style={{ fontSize: 45, fontWeight: '800', color: '#000' }}>{score}</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#000' }}>%</Text>
        </View>
        <Text style={{ color: '#666', fontSize: 10, fontWeight: '800' }}>Out of 100</Text>
        
        {/* લોગો આઈકન */}
        <View className="mt-5">
             <I5 width={30} height={30}></I5>
        </View>     
      </View>
    </View>
  );
}