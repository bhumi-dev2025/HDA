import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UniversalModal } from '../../componunts/Modals/UniversalModal';
import M1 from '../../assets/photo/modal/M1.svg';

interface MeditationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
  initialValue?: string;
}

const MeditationModal: React.FC<MeditationModalProps> = ({ isVisible, onClose, onSave, initialValue }) => {
  const [selectedTime, setSelectedTime] = useState<string>('10m');
  const timeSlots = ['10m', '20m', '30m', '40m', '50m', '60m'];

  useEffect(() => {
    if (isVisible && initialValue) {
      setSelectedTime(initialValue);
    }
  }, [isVisible, initialValue]);

  return (
    <UniversalModal isVisible={isVisible} onClose={onClose}>
      <Text className="font-bold mb-1">Insights</Text>
      <Text className="text-5xl font-extrabold text-[#F2F2F7] mb-20">Meditation</Text>

      <View className="mb-24">
        <M1 width={150} height={150} />
      </View>

      {/* Time Grid */}
      <View className="flex-row flex-wrap justify-between w-full mb-12">
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            onPress={() => setSelectedTime(time)}
            className={`w-[30%] bg-[#E5E5EA] py-4 mb-3 rounded-2xl border ${
              selectedTime === time ? ' border-black' : ' border-gray-300'
            } items-center`}
          >
            <Text className="font-bold text-gray-800">
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="bg-black w-full py-5 rounded-2xl items-center mt-auto"
        onPress={() => onSave(selectedTime)}
      >
        <Text className="text-white font-bold text-lg">Save</Text>
      </TouchableOpacity>
    </UniversalModal>
  );
};

export default MeditationModal;