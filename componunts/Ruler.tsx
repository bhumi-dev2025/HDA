// components/Ruler.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { width } = Dimensions.get('window');

const SEGMENT_WIDTH = 20; // બે લીટા વચ્ચેનું અંતર
const SEGMENT_SPACING = 10; // એક લીટાની વેલ્યુ (10 steps)
const SNAP_INTERVAL = SEGMENT_WIDTH;

interface RulerProps {
  min: number;
  max: number;
  initialValue: number;
  onValueChange: (value: string) => void;
}

const Ruler: React.FC<RulerProps> = ({ min, max, initialValue, onValueChange }) => {
  const flatListRef = useRef<FlatList>(null);
  
  // કુલ કેટલા લીટા દોરવાના છે તેની ગણતરી
  // (10000 - 100) / 10 = 990 લીટા
  const stepsRange = Math.floor((max - min) / SEGMENT_SPACING);
  const data = [...Array(stepsRange + 1).keys()]; // [0, 1, 2, ... 990]

  // Ruler ને સેન્ટરમાં લાવવા માટે બંને બાજુ ખાલી જગ્યા (Spacer)
  const spacerWidth = width / 2;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    
    // ગણિત: Offset પરથી વેલ્યુ શોધવી
    const index = Math.round(offsetX / SEGMENT_WIDTH);
    const value = min + index * SEGMENT_SPACING;

    // વેલ્યુ લિમિટમાં રાખવી
    const clampedValue = Math.max(min, Math.min(max, value));
    
    onValueChange(clampedValue.toString());
  };

  // શરુઆતમાં initialValue પર સ્ક્રોલ કરવા માટે
  useEffect(() => {
    setTimeout(() => {
      if (flatListRef.current) {
        const initialIndex = (initialValue - min) / SEGMENT_SPACING;
        flatListRef.current.scrollToOffset({
          offset: initialIndex * SEGMENT_WIDTH,
          animated: false,
        });
      }
    }, 100);
  }, []);

  const renderItem = ({ index }: { index: number }) => {
    const value = min + index * SEGMENT_SPACING;
    
    // દર 10 લીટા એ મોટો લીટો અને ટેક્સ્ટ (100, 200, 300...)
    const isBigLine = index % 10 === 0;

    return (
      <View style={{ width: SEGMENT_WIDTH, alignItems: 'center' }}>
        {/* લીટાઓ */}
        <View
          style={{
            height: isBigLine ? 50 : 30, // મોટા લીટાની હાઈટ 50, નાનાની 30
            width: 2,
            backgroundColor: isBigLine ? '#000' : '#E0E0E0', // મોટો કાળો, નાનો ગ્રે
            marginTop: isBigLine ? 0 : 20, // નાના લીટાને થોડા નીચે રાખવા
          }}
        />
        
        {/* નંબરો (ફક્ત મોટા લીટા નીચે) */}
        {isBigLine && (
          <Text className="absolute top-14 text-gray-400 font-bold text-xs">
            {value}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View className="h-32 justify-center">
      {/* લાલ/કાળી સેન્ટર લાઈન (Indicator) */}
      <View 
        className="absolute self-center top-0 w-1 h-16 bg-black z-10 rounded-full"
        style={{ left: width / 2 - 2 }} // સેન્ટરમાં ફિક્સ
      />

      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SEGMENT_WIDTH} // એક-એક લીટા પર અટકશે
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacerWidth - SEGMENT_WIDTH / 2 }}
        onScroll={handleScroll}
        scrollEventThrottle={16} // સ્મૂધ સ્ક્રોલિંગ માટે
        keyExtractor={(item) => item.toString()}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: SEGMENT_WIDTH,
          offset: SEGMENT_WIDTH * index,
          index,
        })}
      />
    </View>
  );
};

export default Ruler;