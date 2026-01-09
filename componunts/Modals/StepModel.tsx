import React, { useState,useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { RulerPicker } from 'react-native-ruler-picker';
import * as Haptics from 'expo-haptics';
import { UniversalModal } from '../../componunts/Modals/UniversalModal'; // path check karjo
import M2 from '../../assets/photo/modal/M2.svg';

const { width } = Dimensions.get('window');
const RULER_WIDTH = width - 60;

interface StepPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  initialValue?: string;
}

const StepPickerModal: React.FC<StepPickerModalProps> = ({ isVisible, onClose, onSave,initialValue }) => {
  const [value, setValue] = useState('200');

  useEffect(() => {
    if (isVisible && initialValue) {
      setValue(initialValue);
    }
  }, [isVisible, initialValue]);

  const handleValueChange = (val: string) => {
    // Haptics will work if available on device
    try{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    catch(e){
      // ignore error
    }
    setValue(val);
  };

  return (
    <UniversalModal isVisible={isVisible} onClose={onClose}>
      
      {/* Header Section */}
      <View className="items-center mb-6">
        <Text className="font-bold mb-1">Insights</Text>
        <Text className="text-5xl font-extrabold text-[#F2F2F7] mb-10">Steps</Text>
      </View>

      {/* Icon */}
      <View className="mb-24">
        <M2 width={140} height={140} />
      </View>
      {/* Ruler Section */}
      <View className="w-full items-center justify-center mb-12">
        <Text className="absolute text-gray-400 mb-20">Steps</Text>
        
        {/* width - 80 karvathi padding baad thai jay ane ruler barabar fit thay */}
        <RulerPicker
          width={RULER_WIDTH} 
          height={100}
          min={100}
          max={10000}
          step={10}
          initialValue={100}
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
            fontSize: 40,
            fontWeight: 'bold',
          }}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={() => onSave(value)}
        className="bg-black w-full py-5 rounded-2xl items-center mt-auto"
      >
        <Text className="text-white font-bold text-lg">Save</Text>
      </TouchableOpacity>

    </UniversalModal>
  );
};

export default StepPickerModal;