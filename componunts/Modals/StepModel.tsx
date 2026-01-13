import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { UniversalModal } from '../../componunts/Modals/UniversalModal';
import M2 from '../../assets/photo/modal/M2.svg';

const { width } = Dimensions.get('window');

const RULER_WIDTH = width - 40;
// const RULER_WIDTH = width;


// --- RULER SETTINGS (ડિઝાઈન મુજબ એડજસ્ટ કર્યા) ---
const SEGMENT_WIDTH = 18; // બે લીટા વચ્ચેનું અંતર થોડું વધાર્યું
const STEP_VALUE = 10;
const MIN = 100;
const MAX = 10000;

interface StepPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  initialValue?: string;
}

const StepPickerModal: React.FC<StepPickerModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialValue = "200",
}) => {
  const [currentValue, setCurrentValue] = useState(200);
  const flatListRef = useRef<FlatList>(null);

  const lastHapticIndex = useRef<number>(-1);

  // Ruler Data
  const numberOfSegments = (MAX - MIN) / STEP_VALUE;
  const data = [...Array(numberOfSegments + 1).keys()].map(i => MIN + i * STEP_VALUE);
  
  // Spacer to center the content
  const spacerWidth = RULER_WIDTH / 2;

  useEffect(() => {
    if (isVisible) {
      const val = parseInt(initialValue) || 200;
      setCurrentValue(val);
      setTimeout(() => {
        const index = (val - MIN) / STEP_VALUE;
        flatListRef.current?.scrollToOffset({
          offset: index * SEGMENT_WIDTH,
          animated: false,
        });
      }, 100);
    }
  }, [isVisible, initialValue]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SEGMENT_WIDTH);

    if (index !== lastHapticIndex.current) {
        Haptics.selectionAsync(); // આ "ટક" જેવું ફીલ આપશે
        lastHapticIndex.current = index;
    }
    const value = MIN + index * STEP_VALUE;
    const clampedValue = Math.max(MIN, Math.min(MAX, value));
    setCurrentValue(clampedValue);
  };

  // --- આ ફંક્શનમાં મેઈન ફેરફાર કર્યો છે ---
  const renderItem = ({ item }: { item: number }) => {
    const isMajorLine = item % 100 === 0; // 100, 200, 300...

    return (
      <View style={{ width: SEGMENT_WIDTH, alignItems: 'center', justifyContent: 'flex-end', height: 100 }}>
        
        {/* નંબરો: હવે Absolute છે એટલે તે કપાશે નહીં કે ઉભા નહીં થાય */}
        {isMajorLine && (
          <View style={{ position: 'absolute', top: 0, width: 80, alignItems: 'center' }}>
            <Text className="text-gray-300 text-4xl font-bold ">
              {/* {item} */}
            </Text>
          </View>
        )}

        {/* લીટા (Ticks) */}
        <View
          style={{
            width: isMajorLine ? 3 : 2,
            // ડિઝાઈન મુજબ: મેઈન લીટો મોટો, બાકીના નાના
            height: isMajorLine ? 40 : 20, 
            backgroundColor: '#AEAEB2', // રાખોડી કલર
            borderRadius: 3,
          }}
        />
      </View>
    );
  };

  return (
    <UniversalModal isVisible={isVisible} onClose={onClose}>
      
      {/* Header */}
      <View className="items-center mb-6">
        <Text className="font-bold mb-1">Insights</Text>
        <Text className="text-5xl font-extrabold text-[#F2F2F7] mb-10">Steps</Text>
      </View>

      <View className="mb-24">
        <M2 width={140} height={140} />
      </View>
        
        {/* મેઈન મોટા અક્ષરો */}
        <View className='bg-transparent relative w-full mb-[-25] justify-center'> 
        <View 
          pointerEvents="none" 
          className="bg-transparent absolute top-0 w-full items-center z-20"
        >
            {/* White Background આપ્યું જેથી પાછળ સરકતા ગ્રે નંબરો દેખાય નહીં */}
            <View className="bg-white items-center px-4">
                <Text className="text-4xl font-extrabold text-black">
                    {currentValue}
                </Text>
                <Text className="text-gray-400 font-medium mt-1 text-sm">Steps</Text>
            </View>
        </View>
      </View>

      {/* --- RULER CONTAINER --- */}
      <View className="relative h-28 mb-14 w-full justify-center mt-10">
        
        {/* Black Indicator (વચ્ચેની કાળી સોય) */}
        <View 
          className="absolute self-center bg-black z-10"
          style={{ 
            width: 4, 
            height: 50, // લીટા કરતા મોટી રાખી
            bottom: 0, 
            borderRadius: 4,
            left: '50%',
            marginLeft: -2, // અડજસ્ટમેન્ટ
          }} 
        />

        <FlatList
          ref={flatListRef}
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SEGMENT_WIDTH}
          // snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: spacerWidth - SEGMENT_WIDTH / 2 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={renderItem}
          keyExtractor={(item) => item.toString()}
          getItemLayout={(_, index) => ({
            length: SEGMENT_WIDTH,
            offset: SEGMENT_WIDTH * index,
            index,
          })}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={() => onSave(currentValue.toString())}
        className="bg-black w-full py-5 rounded-2xl items-center mt-auto"
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-lg">Save</Text>
      </TouchableOpacity>

    </UniversalModal>
  );
};

export default StepPickerModal;