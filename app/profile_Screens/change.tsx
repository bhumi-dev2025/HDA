import React, { useState } from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GoalWizard() {
  // 1. Step Logic (0=Meditation, 1=Steps, 2=Water, 3=Sleep)
  const [currentStep, setCurrentStep] = useState(0);

  // 2. Data State
  const [goals, setGoals] = useState({
    meditation: '10m',
    steps: 6000,
    water: 1.5,
    sleepStart: '08',
    sleepEnd: '24',
  });

  // Steps Configuration
  const stepsConfig = [
    { title: 'Daily Meditation', desc: 'Set a goal for mindfulness.', type: 'selection' },
    { title: 'Daily Steps', desc: 'How active are you today?', type: 'ruler' },
    { title: 'Daily Water', desc: 'Hydration target.', type: 'counter' },
    { title: 'Sleep Time', desc: 'Duration of sleep.', type: 'time' },
  ];

  // Next Step Function
  const handleNext = () => {
    if (currentStep < stepsConfig.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Saving Goals:", goals);
      alert("All Goals Updated!");
    }
  };

  // --- UI COMPONENTS (NativeWind) ---

  // 1. Meditation (Grid)
  const renderMeditation = () => {
    const options = ['10m', '20m', '30m', '40m', '50m', '60m'];
    return (
      <View className="flex-row flex-wrap justify-between w-full px-2">
        {options.map((opt) => {
          const isActive = goals.meditation === opt;
          return (
            <TouchableOpacity 
              key={opt}
              onPress={() => setGoals({...goals, meditation: opt})}
              className={`w-[48%] py-6 rounded-2xl mb-4 items-center ${
                isActive ? 'bg-gray-200 border border-black' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-lg ${isActive ? 'font-bold text-black' : 'text-gray-600'}`}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // 2. Steps (Ruler Look)
  const renderSteps = () => (
    <View className="items-center w-full">
      {/* Visual Number Display */}
      <View className="flex-row items-center space-x-6 mb-2">
        <Text className="text-2xl text-gray-300 font-bold">{goals.steps - 100}</Text>
        <Text className="text-5xl text-black font-bold">{goals.steps}</Text>
        <Text className="text-2xl text-gray-300 font-bold">{goals.steps + 100}</Text>
      </View>
      <Text className="text-gray-400 text-sm font-medium mb-8">Steps</Text>

      {/* Control Buttons */}
      <View className="flex-row space-x-10 mb-8">
         <TouchableOpacity 
            className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => setGoals({...goals, steps: goals.steps - 100})}
         >
           <Ionicons name="remove" size={24} color="black" />
         </TouchableOpacity>

         <TouchableOpacity 
            className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => setGoals({...goals, steps: goals.steps + 100})}
         >
           <Ionicons name="add" size={24} color="black" />
         </TouchableOpacity>
      </View>

      {/* Fake Ruler Lines */}
      <View className="flex-row items-end h-10 space-x-2">
        {[...Array(15)].map((_, i) => (
          <View 
            key={i} 
            className={`w-0.5 rounded-full ${i === 7 ? 'h-10 bg-black' : 'h-5 bg-gray-300'}`} 
          />
        ))}
      </View>
    </View>
  );

  // 3. Water (Counter)
  const renderWater = () => (
    <View className="flex-row items-center justify-center w-full space-x-8">
       {/* Minus Button */}
       <TouchableOpacity 
          className="w-16 h-16 bg-white border border-gray-200 rounded-2xl items-center justify-center shadow-sm"
          onPress={() => setGoals({...goals, water: Math.max(0, parseFloat((goals.water - 0.1).toFixed(1)))})} 
       >
         <Ionicons name="remove" size={30} color="black" />
       </TouchableOpacity>

       {/* Value */}
       <View className="items-center w-24">
         <Text className="text-5xl font-bold text-black">{goals.water}</Text>
         <Text className="text-gray-400 text-sm font-bold mt-1">Liters</Text>
       </View>

       {/* Plus Button */}
       <TouchableOpacity 
          className="w-16 h-16 bg-white border border-gray-200 rounded-2xl items-center justify-center shadow-sm"
          onPress={() => setGoals({...goals, water: Math.max(0, parseFloat((goals.water + 0.1).toFixed(1)))})}
        >
         <Ionicons name="add" size={30} color="black" />
       </TouchableOpacity>
    </View>
  );

  // 4. Sleep (Time)
  const renderSleep = () => (
    <View className="items-center justify-center bg-gray-50 rounded-3xl w-full py-10">
      <View className="flex-row items-center">
        <Text className="text-4xl font-bold text-black">{goals.sleepStart} h</Text>
        <Text className="text-4xl font-bold text-gray-300 mx-2"> : </Text>
        <Text className="text-4xl font-bold text-black">{goals.sleepEnd} m</Text>
      </View>
      <Text className="text-gray-400 mt-4 text-sm">Sleep Duration</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-between py-4">
        
        {/* --- Header --- */}
        <View className="flex-row justify-between items-center mt-4">
          <TouchableOpacity onPress={() => currentStep > 0 && setCurrentStep(currentStep - 1)}>
             <Ionicons name="chevron-back" size={28} color={currentStep === 0 ? "#ccc" : "black"} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">Change Goals</Text>
          <View className="w-7" /> 
        </View>

        {/* --- Title Section --- */}
        <View className="mt-8 mb-4">
          <Text className="text-3xl font-bold text-black mb-2 text-center">
            {stepsConfig[currentStep].title}
          </Text>
          <Text className="text-base text-gray-500 text-center px-4 leading-6">
            {stepsConfig[currentStep].desc}
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

      </View>
    </SafeAreaView>
  );
}