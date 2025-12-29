import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// નવી લાઈબ્રેરી ઈમ્પોર્ટ કરી
import { RulerPicker } from 'react-native-ruler-picker';
import * as Haptics from 'expo-haptics';
import { Plus, Minus } from 'lucide-react-native';
import CustomTimePicker from '../../componunts/TimePicker';
import { useRouter } from 'expo-router';
const { width } = Dimensions.get('window');

export default function GoalWizard() {
  const router = useRouter();
  // 1. Step Logic (0=Meditation, 1=Steps, 2=Water, 3=Sleep)
  const [currentStep, setCurrentStep] = useState(0);

  const [isPlusPressed, setIsPlusPressed] = useState(false);
        const [isMinusPressed, setIsMinusPressed] = useState(false);

  // 2. Data State
  const [goals, setGoals] = useState({
    meditation: '10m',
    steps: 200, // Default steps
    water: 1.5,
    sleepHours: '08',
    sleepMinutes: '24',
  });

  // Steps Configuration
  const stepsConfig = [
    { title: 'Daily Meditation', type: 'selection' },
    { title: 'Daily Steps', type: 'ruler' },
    { title: 'Daily Water', type: 'counter' },
    { title: 'Sleep Time', type: 'time' },
  ];

  // Next Step Function
  const handleNext = () => {
    if (currentStep < stepsConfig.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Saving Goals:", goals);
      router.back();
    }
  };

  // --- UI COMPONENTS (NativeWind) ---

  // 1. Meditation (Grid)
  const renderMeditation = () => {
    const options = ['10m', '20m', '30m', '40m', '50m', '60m'];
    return (
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {options.map((time) => {
          const isActive = goals.meditation === time;
          return (
            <TouchableOpacity
              key={time}
              onPress={() => setGoals({ ...goals, meditation: time })}
              className={`w-[30%] bg-[#E5E5EA] py-4 mb-3 rounded-2xl border ${
                            isActive? 'border-black' : 'border-gray-300'
                          } items-center`}
            >
              <Text className="font-bold text-gray-800">{time}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // 2. Steps (UPDATED WITH RULER PICKER)
  const renderSteps = () => {
    
    // Ruler માં વેલ્યુ બદલાય ત્યારે આ ફંક્શન કોલ થશે
    const handleRulerChange = (val:any) => {
        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // State update (string mathi number ma convert karyu)
        setGoals({ ...goals, steps: parseInt(val) });
    };

    return (
      <View className="items-center justify-center w-full mt-20">
        
        {/* લેબલ થોડું એડજસ્ટ કર્યું જેથી તે નંબરની નીચે બરાબર દેખાય */}
        <Text className="absolute top-[1px] text-gray-400 z-10 font-medium">Steps</Text>

        <RulerPicker
            width={width - 40}
            height={100} // Height વધારી જેથી બરાબર દેખાય
            min={100}
            max={10000}
            step={10}
            initialValue={goals.steps}
            onValueChange={handleRulerChange}
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
    );
  };

  // 3. Water (Counter)
  // const renderWater = () => (
  //   <View className="flex-row items-center justify-center w-full space-x-8">
  //     {/* Minus Button */}
  //     <TouchableOpacity
  //       className="w-16 h-16 bg-white border border-gray-200 rounded-2xl items-center justify-center shadow-sm"
  //       onPress={() => setGoals({ ...goals, water: Math.max(0, parseFloat((goals.water - 0.1).toFixed(1))) })}
  //     >
  //       <Ionicons name="remove" size={30} color="black" />
  //     </TouchableOpacity>

  //     {/* Value */}
  //     <View className="items-center w-24">
  //       <Text className="text-5xl font-bold text-black">{goals.water}</Text>
  //       <Text className="text-gray-400 text-sm font-bold mt-1">Liters</Text>
  //     </View>

  //     {/* Plus Button */}
  //     <TouchableOpacity
  //       className="w-16 h-16 bg-white border border-gray-200 rounded-2xl items-center justify-center shadow-sm"
  //       onPress={() => setGoals({ ...goals, water: Math.max(0, parseFloat((goals.water + 0.1).toFixed(1))) })}
  //     >
  //       <Ionicons name="add" size={30} color="black" />
  //     </TouchableOpacity>
  //   </View>
  // );
  // 3. Water (તમારી નવી ડિઝાઈન મુજબ)
  const renderWater = () => {
    
    // Increment Logic
    const increment = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setGoals({ ...goals, water: parseFloat((goals.water + 0.1).toFixed(1)) });
    };

    // Decrement Logic
    const decrement = () => {
        if (goals.water > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setGoals({ ...goals, water: parseFloat((goals.water - 0.1).toFixed(1)) });
        }
    };

    return (
        <View className="flex-row items-center justify-between w-full px-16 mt-20">
              
              {/* PLUS BUTTON (Left Side as per your code) */}
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
  
              {/* Value Display */}
              <View className="items-center">
                <Text className="text-5xl font-bold text-black">{goals.water.toFixed(1)}</Text>
                <Text className="text-gray-400 text-lg mt-1">Liters</Text>
              </View>
  
              {/* MINUS BUTTON (Right Side as per your code) */}
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
    );
  };

  const renderSleep = () => {
    
    // તમારા કસ્ટમ પીકર નો ડેટા અપડેટ કરવાનું ફંક્શન
    const handleCustomTimeChange = (h: any, m: any) => {
        // જો તમારું કસ્ટમ પીકર વાઈબ્રેશન ના આપતું હોય તો અહીં મૂકી શકાય
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setGoals({ ...goals, sleepHours: h, sleepMinutes: m });
    };

    return (
      <View className="w-full items-center justify-center">
        
        {/* Main Display Text */}
        <View className="items-center">
            <Text className="text-gray-400 font-bold text-xl">
               {/* ડેટા બતાવવા માટે goals માંથી વેલ્યુ લીધી */}
               {goals.sleepHours} h : {goals.sleepMinutes} m
            </Text>
        </View>

        {/* YOUR CUSTOM COMPONENT HERE */}
        <View className="w-full items-center">
             <CustomTimePicker 
                onTimeChange={handleCustomTimeChange} 
             />
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] p-6 justify-between">
        {/* --- Title Section --- */}
        <View>
            <Text className="text-xl font-bold text-black mb-2">
            {stepsConfig[currentStep].title}
            </Text>
            <Text className="text-left text-base text-gray-400 mb-6 leading-5">
            Set a goal based on how active you are, or how active{'\n'}you'd like to be, each day.
            </Text>
        </View>

        {/* --- DYNAMIC BODY --- */}
        <View className="flex-1 justify-center items-center">
          {currentStep === 0 && renderMeditation()}
          {currentStep === 1 && renderSteps()}
          {currentStep === 2 && renderWater()}
          {currentStep === 3 && renderSleep()}
        </View>

        {/* --- Bottom Button --- */}
        <TouchableOpacity
          className="w-full h-14 bg-black rounded-xl justify-center items-center mb-4 shadow-lg"
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">
            {currentStep === stepsConfig.length - 1 ? 'Save Goals' : 'Change Goal'}
          </Text>
        </TouchableOpacity>
    </SafeAreaView>
     );
}