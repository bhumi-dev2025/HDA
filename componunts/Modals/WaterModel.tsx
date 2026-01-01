import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { UniversalModal } from '../Modals/UniversalModal';
import M3 from '../../assets/photo/modal/M3.svg';

interface WaterTrackerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (liters: number) => void;
}

const WaterTrackerModal: React.FC<WaterTrackerModalProps> = ({ visible, onClose, onSave }) => {
  const [liters, setLiters] = useState(1.5);

  //button press.. event 
  const [isPlusPressed, setIsPlusPressed] = useState(false);
  const [isMinusPressed, setIsMinusPressed] = useState(false);

  const increment = () => setLiters((prev) => parseFloat((prev + 0.1).toFixed(1)));
  const decrement = () => { if (liters > 0) setLiters((prev) => parseFloat((prev - 0.1).toFixed(1))); };

  return (
    <UniversalModal isVisible={visible} onClose={onClose}>
      <Text className="font-bold mb-1">Insights</Text>
      <Text className="text-6xl font-extrabold text-[#F2F2F7] mb-20">Water</Text>

      <View className="mb-24">
        <M3 width={150} height={150} />
      </View>

      <View className="flex-row items-center justify-between w-full px-16 mb-16">
        {/* PLUS BUTTON */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => setIsPlusPressed(true)}
          onPressOut={() => setIsPlusPressed(false)}
          onPress={increment}
          className={`w-20 h-20 rounded-2xl items-center justify-center border ${isPlusPressed ? 'bg-black border-black' : 'bg-white border-black'
            }`}
        >
          <Plus color={isPlusPressed ? "white" : "black"} size={32} strokeWidth={3} />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-4xl font-black text-black">{liters.toFixed(1)}</Text>
          <Text className="text-gray-400 text-lg">Liters</Text>
        </View>

        {/* MINUS BUTTON */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => setIsMinusPressed(true)}
          onPressOut={() => setIsMinusPressed(false)}
          onPress={decrement}
          className={`w-20 h-20 rounded-2xl items-center justify-center border ${isMinusPressed ? 'bg-black border-black' : 'bg-white border-black'
            }`}
        >
          <Minus color={isMinusPressed ? "white" : "black"} size={32} strokeWidth={3} />
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        onPress={() => onSave(liters)}
        className="bg-black w-full py-5 rounded-3xl items-center mt-auto"
      >
        <Text className="text-white text-lg font-bold">Save</Text>
      </TouchableOpacity>
    </UniversalModal>
  );
};

export default WaterTrackerModal;