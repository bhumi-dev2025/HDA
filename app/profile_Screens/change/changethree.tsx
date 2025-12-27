import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar,Pressable} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus } from 'lucide-react-native'; 

// આ સ્ક્રીન માટેનું મુખ્ય કમ્પોનન્ટ
const waterGoalScreen = () => {
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
    // SafeAreaView નો ઉપયોગ નોચ અને સ્ટેટસ બારથી બચવા માટે
    <SafeAreaView className="flex-1 bg-[#FAFAFA] p-6">
      <StatusBar barStyle="dark-content" />
        <Text className="text-xl font-bold text-black mb-2">
                Daily Water
              </Text>
              
              <Text className="text-left text-base text-gray-400 mb-6 leading-5">
                Set a goal based on how active you are, or how active{'\n'}you'd like to be, each day.
              </Text>
          
          <View className="flex-row items-center justify-between w-full px-16">
                      
                      {/* PLUS BUTTON */}
                      <TouchableOpacity 
                        activeOpacity={1}
                        onPressIn={() => setIsPlusPressed(true)}
                        onPressOut={() => setIsPlusPressed(false)}
                        onPress={increment}
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
                                {/* Save Button */}
                      <TouchableOpacity 
                        className="bg-black w-full py-5 rounded-2xl items-center"
                        onPress={()=>(liters)}
                      >
                        <Text className="text-white font-bold text-lg">Change Goals</Text>
                      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default waterGoalScreen;