import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar ,Dimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RulerPicker } from 'react-native-ruler-picker';
import * as Haptics from 'expo-haptics';
const { width } = Dimensions.get('window'); // Screen width lai lo

// આ સ્ક્રીન માટેનું મુખ્ય કમ્પોનન્ટ
const stepGoalScreen = () => {
  const [value, setValue] = useState('200');
  
    const handleValueChange = (val: string) => {
      // આ વેલ્યુ બદલાય ત્યારે હળવું વાઇબ્રેશન આપશે
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setValue(val);
    };

  return (
    // SafeAreaView નો ઉપયોગ નોચ અને સ્ટેટસ બારથી બચવા માટે
    <SafeAreaView className="flex-1 bg-[#FAFAFA] p-6">
      <StatusBar barStyle="dark-content" />
        <Text className="text-xl font-bold text-black mb-2">
                Daily Steps
              </Text>
              
              <Text className="text-left text-base text-gray-400 mb-6 leading-5">
                Set a goal based on how active you are, or how active{'\n'}you'd like to be, each day.
              </Text>
          
          <View className="w-full items-center mt-32">
                      <Text className="absolute text-gray-400">Steps</Text>
          
                      <RulerPicker
                        width={width - 40}
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
                        className="bg-black w-full py-5 rounded-2xl items-center"
                        onPress={()=>(value)}
                      >
                        <Text className="text-white font-bold text-lg">Change Goals</Text>
                      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default stepGoalScreen;