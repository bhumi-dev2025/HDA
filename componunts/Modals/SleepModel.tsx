import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UniversalModal } from '../Modals/UniversalModal';
import CustomTimePicker from '../TimePicker';
import M4 from '../../assets/photo/modal/M4.svg';
import {SleepModalProps} from '../../types'

const SleepModal: React.FC<SleepModalProps> = ({ isVisible, onClose, onSave, initialValue }:SleepModalProps) => {
  const [selectedTime, setSelectedTime] = useState({ hour: '08', minute: '24' });

  useEffect(() => {
    if (isVisible && initialValue) {
      setSelectedTime(initialValue);
    }
  }, [isVisible, initialValue]);

  return (
    <UniversalModal isVisible={isVisible} onClose={onClose}>
      
      {/* Header Section */}
      <View className="items-center mb-1">
        <Text className="font-bold mb-1">Insights</Text>
        <Text className="text-5xl font-extrabold text-[#F2F2F7] mb-10">Sleep</Text>
      </View>

      {/* Icon */}
      <View className="mb-10">
        <M4 width={150} height={150} />
      </View>

      {/* Digital Time Display */}
      <View className="items-center">
        <Text className="text-gray-400 font-bold text-xl">
          {selectedTime.hour}h:{selectedTime.minute}m
        </Text>
      </View>

      {/* Custom Picker Section */}
      <View className="w-full items-center mb-16">
        <CustomTimePicker 
          onTimeChange={(h, m) => setSelectedTime({ hour: h, minute: m })}
          initialHour={selectedTime.hour} 
          initialMinute={selectedTime.minute} 
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={() => onSave(selectedTime)}
        className="bg-black w-full py-5 rounded-2xl items-center mt-auto"
      >
        <Text className="text-white font-bold text-lg">Save</Text>
      </TouchableOpacity>

    </UniversalModal>
  );
};

export default SleepModal;