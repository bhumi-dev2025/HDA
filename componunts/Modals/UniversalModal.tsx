import React, { useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Pressable, 
  PanResponder, 
  Animated, 
  Dimensions ,
  ViewStyle
} from 'react-native';

const { height } = Dimensions.get('window');

interface UniversalModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalClassName?: string;
  customStyle?: ViewStyle;
}

export const UniversalModal = ({ isVisible, onClose, children,modalClassName,customStyle }: UniversalModalProps) => {
  // મોડલની પોઝિશન માટેનું એનિમેશન
  const panY = useRef(new Animated.Value(0)).current;

  // જ્યારે મોડલ ખૂલે ત્યારે પોઝિશન રીસેટ કરો
  useEffect(() => {
    if (isVisible) {
      panY.setValue(0);
    }
  }, [isVisible]);

  // --- PanResponder Logic ---
  // આ ફક્ત હેન્ડલ (ઉપરના ભાગ) માટે જ છે
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderMove: (_, gestureState) => {
        // ખાલી નીચે તરફ જ ડ્રેગ થવા દેવું
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      
      onPanResponderRelease: (_, gestureState) => {
        // જો સ્ક્રીનના 20% જેટલું નીચે ખેંચ્યું હોય તો બંધ કરવું
        if (gestureState.dy > height * 0.2) {
          onClose();
        } else {
          // નહીંતર પાછું ઉપર લાવી દેવું (Spring Animation)
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* 1. Backdrop - પાછળ ક્લિક કરતા બંધ થાય */}
      <Pressable 
        className="absolute top-0 bottom-0 left-0 right-0 bg-black/40" 
        onPress={onClose} 
      />

      <View className="flex-1 justify-end" pointerEvents="box-none">
        
        {/* 2. Main Animated Card */}
        {/* અહિયાં આપણે PanResponder નથી લગાવ્યું, એટલે અંદરનું કન્ટેન્ટ મુક્ત રહેશે */}
        <Animated.View 
          style={[{ transform: [{ translateY: panY }] }, customStyle]}
          className={`bg-white rounded-t-[40px] pb-10 w-full items-center shadow-2xl min-h-[50%] overflow-hidden ${modalClassName || 'min-h-[50%]'}`}
        >
          
          {/* --- 3. DRAG HANDLE ZONE (Touch Area) --- */}
          {/* ફક્ત આ ગ્રે લીટા વાળા ભાગને જ ડ્રેગ કરી શકાશે */}
          <View 
            {...panResponder.panHandlers} 
            className="w-full h-14 items-center justify-center bg-transparent z-50 absolute top-0"
          >
            {/* Visual Grey Bar */}
            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </View>
          {/* -------------------------------------- */}

          {/* 4. Content Area */}
          {/* થોડું padding top આપ્યું જેથી content હેન્ડલની નીચે ન દબાય */}
          <View className="w-full p-6 pt-16 items-center">
             {children}
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};