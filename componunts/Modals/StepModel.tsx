import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { RulerPicker } from 'react-native-ruler-picker';
import * as Haptics from 'expo-haptics';
import M2 from '../../assets/photo/modal/M2.svg'


const StepPickerModal = ({ isVisible, onClose,onSave }: { isVisible: boolean, onClose: () => void,onSave: () => void}) => {
  const [value, setValue] = useState('200');

  const handleValueChange = (val: string) => {
    // આ વેલ્યુ બદલાય ત્યારે હળવું વાઇબ્રેશન આપશે
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue(val);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-[40px] p-6 items-center h-[70%]">

          <View className="w-12 h-1 bg-gray-300 rounded-full mb-6" />

          {/* Header */}
          <Text className="font-bold text-lg">Insights</Text>
          <Text className="text-[#F2F2F7] text-6xl absolute font-extrabold top-20">Steps</Text>

          {/* Icon Placeholder (Shoes) */}
          <View className="h-40 w-40 justify-center items-center mt-28">
            {/* અહિયાં તમારી ઇમેજ આવશે */}
            <M2></M2>
          </View>

          {/* Ruler Section */}
          <View className="w-full items-center mt-32">
            {/* <Text className="text-4xl font-bold text-black">{value}</Text> */}
            <Text className="absolute text-gray-400">Steps</Text>

            <RulerPicker
              width={500}
              height={100}
              min={100}
              max={10000}
              step={10}
              initialValue={200}
              onValueChange={handleValueChange}
              unit=""
              fractionDigits={0}
              indicatorColor="black"
              shortStepColor="#AEAEB2"
              longStepColor="#AEAEB2"
              indicatorHeight={40}
              longStepHeight={50}
              shortStepHeight={20}
              valueTextStyle={{
                color: 'black',
                fontSize: 60,
                fontWeight: 'bold',
              }}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={onSave}
            className="bg-black w-full py-4 rounded-2xl items-center absolute bottom-10 mx-6"
          >
            <Text className="text-white font-bold text-lg">Save</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default StepPickerModal;