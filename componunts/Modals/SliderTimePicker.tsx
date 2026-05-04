import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions, FlatList, NativeScrollEvent,
  NativeSyntheticEvent, Text, View,
} from 'react-native';

const { width } = Dimensions.get('window');
const SEGMENT_WIDTH = 10;
const SPACER = (width - 48) / 2;

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

interface SliderRowProps {
  data: string[];
  initialIndex: number;
  leftLabel: string;
  rightLabel: string;
  unit: string;
  onValueChange: (val: string) => void;
}

const SliderRow = ({ data, initialIndex, leftLabel, rightLabel, unit, onValueChange }: SliderRowProps) => {
  const flatListRef = useRef<FlatList>(null);
  const lastHapticIndex = useRef(-1);
  const [displayValue, setDisplayValue] = useState(data[initialIndex]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: initialIndex * SEGMENT_WIDTH,
        animated: false,
      });
    }, 100);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SEGMENT_WIDTH);
    const clamped = Math.max(0, Math.min(data.length - 1, index));
    if (clamped !== lastHapticIndex.current) {
      Haptics.selectionAsync();
      lastHapticIndex.current = clamped;
      setDisplayValue(data[clamped]);
      onValueChange(data[clamped]);
    }
  };

  const renderTick = ({ index }: { item: string; index: number }) => {
    const isMajor = index % 5 === 0;
    return (
      <View style={{ width: SEGMENT_WIDTH, alignItems: 'center', justifyContent: 'flex-end', height: 36 }}>
        <View style={{
          width: isMajor ? 2.5 : 1.5,
          height: isMajor ? 22 : 12,
          backgroundColor: isMajor ? '#555' : '#AAAAAA',
          borderRadius: 2,
        }} />
      </View>
    );
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Left / Right labels + value */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A1A2E' }}>{leftLabel}</Text>
        <View style={{ backgroundColor: '#FF5A1F', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{displayValue}{unit}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A1A2E' }}>{rightLabel}</Text>
      </View>

      {/* Slider Track */}
      <View style={{
        backgroundColor: '#1A1A2E', borderRadius: 16,
        paddingVertical: 12, overflow: 'hidden',
        flexDirection: 'row', alignItems: 'center',
      }}>
        {/* Center indicator line */}
        <View style={{
          position: 'absolute', left: '50%', top: 6, bottom: 6,
          width: 2.5, backgroundColor: '#FF5A1F', borderRadius: 2, zIndex: 10,
        }} />

        <FlatList
          ref={flatListRef}
          data={data}
          horizontal
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderTick}
          showsHorizontalScrollIndicator={false}
          snapToInterval={SEGMENT_WIDTH}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={{ paddingHorizontal: SPACER }}
          getItemLayout={(_, index) => ({
            length: SEGMENT_WIDTH,
            offset: SEGMENT_WIDTH * index,
            index,
          })}
        />
      </View>
    </View>
  );
};

interface SliderTimePickerProps {
  onTimeChange: (hour: string, minute: string) => void;
  initialHour?: string;
  initialMinute?: string;
}

const SliderTimePicker = ({
  onTimeChange,
  initialHour = '08',
  initialMinute = '00',
}: SliderTimePickerProps) => {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  return (
    <View style={{ width: '100%', paddingHorizontal: 4 }}>
      <SliderRow
        data={HOURS}
        initialIndex={parseInt(initialHour)}
        leftLabel="0h"
        rightLabel="23h"
        unit="h"
        onValueChange={(val) => { setHour(val); onTimeChange(val, minute); }}
      />
      <SliderRow
        data={MINUTES}
        initialIndex={parseInt(initialMinute)}
        leftLabel="0m"
        rightLabel="59m"
        unit="m"
        onValueChange={(val) => { setMinute(val); onTimeChange(hour, val); }}
      />
    </View>
  );
};

export default SliderTimePicker;