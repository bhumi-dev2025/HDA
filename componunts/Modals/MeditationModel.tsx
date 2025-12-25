import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import M1 from '../../assets/photo/modal/M1.svg'

interface MeditationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
}

const MeditationModal: React.FC<MeditationModalProps> = ({ isVisible, onClose, onSave }) => {
  const [selectedTime, setSelectedTime] = useState<string>('10m');
  const timeSlots = ['10m', '20m', '30m', '40m', '50m', '60m'];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <Pressable 
        className="flex-1 bg-black/40 justify-end" 
        onPress={onClose}
      >
        {/* Modal Content */}
        <View 
          className="bg-white rounded-t-[40px] p-8 pb-10 items-center shadow-lg"
          onStartShouldSetResponder={() => true} // રોકવા માટે કે ક્લિક અંદર થાય તો મોડલ બંધ ન થાય
        >
          {/* Handle bar on top */}
          <View className="w-12 h-1 bg-gray-300 rounded-full mb-6" />

          <Text className="font-bold mb-1">Insights</Text>
          <Text className="text-5xl font-extrabold text-[#F2F2F7] mb-6">Meditation</Text>

          {/* Lotus Icon Placeholder - તમે તમારું SVG અહીં મૂકી શકો છો */}
          <View className="mb-20 m-8 items-center justify-center">
             <M1 width={150} height={150} />
          </View>

          {/* Time Grid */}
          <View className="flex-row flex-wrap justify-between w-full mb-12">
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                className={`w-[30%] bg-[#E5E5EA] py-4 mb-3 rounded-2xl border ${
                  selectedTime === time ? 'border-black' : 'border-gray-300'
                } items-center`}
              >
                <Text className="font-bold text-gray-800">{time}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            className="bg-black w-full py-5 rounded-2xl items-center"
            onPress={()=>onSave(selectedTime)}
          >
            <Text className="text-white font-bold text-lg">Save</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default MeditationModal;