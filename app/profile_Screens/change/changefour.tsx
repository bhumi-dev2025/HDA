import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomTimePicker from '../../../componunts/TimePicker'


// આ સ્ક્રીન માટેનું મુખ્ય કમ્પોનન્ટ
const sleepGoalScreen = () => {
     const [selectedTime, setSelectedTime] = useState({ hour: '08', minute: '24' });
   

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] p-6">
      <StatusBar barStyle="dark-content" />
        <Text className="text-xl font-bold text-black mb-2">
                Daily Sleep
              </Text>
              
              <Text className="text-left text-base text-gray-400 mb-6 leading-5">
                Set a goal based on how active you are, or how active{'\n'}you'd like to be, each day.
              </Text>
          
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
                        className="bg-black w-full py-5 rounded-2xl items-center"
                        onPress={()=>(selectedTime)}
                      >
                        <Text className="text-white font-bold text-lg">Change Goals</Text>
                      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default sleepGoalScreen;