import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import CustomTimePicker from '../TimePicker'
import M4 from '../../assets/photo/modal/M4.svg'


const SleepModal = ({ isVisible, onClose, onSave }: { isVisible: boolean, onClose: () => void ,onSave:()=>void}) => {
  const [selectedTime, setSelectedTime] = useState({ hour: '08', minute: '24' });


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
          <Text className="text-[#F2F2F7] text-6xl absolute font-extrabold top-20">Sleep</Text>

          {/* Icon Placeholder (Shoes) */}
          <View className="h-40 w-40 justify-center items-center mt-28">
            {/* અહિયાં તમારી ઇમેજ આવશે */}
            <M4></M4>
          </View>
          <View className="mt-14 items-center">
             <Text className="text-gray-400 font-bold text-xl">
               {selectedTime.hour}h : {selectedTime.minute}m
             </Text>
          </View>

          {/* Ruler Section */}
          <View className="w-full items-center">
            <CustomTimePicker onTimeChange={(h, m) => setSelectedTime({ hour: h, minute: m })}></CustomTimePicker>
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

export default SleepModal;