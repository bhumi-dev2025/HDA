import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Plus, Minus } from 'lucide-react-native'; 
import M3 from '../../assets/photo/modal/M3.svg';

const WaterTrackerModal = ({ visible, onClose,onSave }: { visible: boolean; onClose: () => void,onSave:()=>void }) => {
  const [liters, setLiters] = useState(1.5);

  // બટન પ્રેસ છે કે નહીં તે જાણવા માટેની State
  const [isPlusPressed, setIsPlusPressed] = useState(false);
  const [isMinusPressed, setIsMinusPressed] = useState(false);

  const increment = () => setLiters((prev) => parseFloat((prev + 0.1).toFixed(1)));
  const decrement = () => {
    if (liters > 0) {
      setLiters((prev) => parseFloat((prev - 0.1).toFixed(1)));
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <View className="bg-white rounded-t-[40px] p-6 items-center h-[70%]">
          <View className="w-10 h-1 bg-gray-300 rounded-full mb-6" />

          <Text className="font-bold text-lg">Insights</Text>
          <Text className="text-gray-100 text-6xl font-extrabold absolute top-20">Water</Text>

          <View className="mt-28 mb-20">
            <M3 />
          </View>

          <View className="flex-row items-center justify-between w-full px-16">
            
            {/* PLUS BUTTON */}
            <TouchableOpacity 
              activeOpacity={1} // Default opacity change બંધ કરવા માટે
              onPressIn={() => setIsPlusPressed(true)}
              onPressOut={() => setIsPlusPressed(false)}
              onPress={increment}
              // Conditional Styling: જો પ્રેસ હોય તો કલર બદલાશે
              className={`w-20 h-20 rounded-2xl items-center justify-center border ${
                isPlusPressed ? 'bg-black border-black' : 'bg-white border-gray-200'
              }`}
            >
              <Plus color={isPlusPressed ? "white" : "black"} size={32} strokeWidth={3} />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-4xl font-bold text-black">{liters.toFixed(1)}</Text>
              <Text className="text-gray-400 text-lg">Liters</Text>
            </View>

            {/* MINUS BUTTON */}
            <TouchableOpacity 
              activeOpacity={1}
              onPressIn={() => setIsMinusPressed(true)}
              onPressOut={() => setIsMinusPressed(false)}
              onPress={decrement}
              className={`w-20 h-20 rounded-2xl items-center justify-center border ${
                isMinusPressed ? 'bg-black border-black' : 'bg-white border-gray-200'
              }`}
            >
              <Minus color={isMinusPressed ? "white" : "black"} size={32} strokeWidth={3} />
            </TouchableOpacity>

          </View>

          <TouchableOpacity 
            onPress={onSave}
            className="bg-black w-full py-5 rounded-2xl items-center absolute bottom-10 mx-6"
          >
            <Text className="text-white text-lg font-bold">Save</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default WaterTrackerModal;