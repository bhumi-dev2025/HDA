import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// આ સ્ક્રીન માટેનું મુખ્ય કમ્પોનન્ટ
const MeditationGoalScreen = () => {
  const [selectedTime, setSelectedTime] = useState<string>('10m');
  const timeSlots = ['10m', '20m', '30m', '40m', '50m', '60m'];

  return (
    // SafeAreaView નો ઉપયોગ નોચ અને સ્ટેટસ બારથી બચવા માટે
    <SafeAreaView className="flex-1 bg-[#FAFAFA] p-6">
      <StatusBar barStyle="dark-content" />
        <Text className="text-xl font-bold text-black mb-2">
                Daily Meditation
              </Text>
              
              <Text className="text-left text-base text-gray-400 mb-6 leading-5">
                Set a goal based on how active you are, or how active{'\n'}you'd like to be, each day.
              </Text>
          
          <View className="flex-row flex-wrap justify-between gap-y-4">
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
                        onPress={()=>(selectedTime)}
                      >
                        <Text className="text-white font-bold text-lg">Save</Text>
                      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MeditationGoalScreen;