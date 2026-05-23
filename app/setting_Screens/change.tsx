import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RulerPicker } from 'react-native-ruler-picker';
import * as Haptics from 'expo-haptics';
import { Plus, Minus } from 'lucide-react-native';
import CustomTimePicker from '../../componunts/TimePicker';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const homeBg = require('../../assets/photo/login/2.0/home.png');
const buttonBg = require('../../assets/2.0/model/button.png');

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
              style={{
                width: '30%',
                paddingVertical: 16,
                marginBottom: 12,
                borderRadius: 16,
                alignItems: 'center',
                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
              }}
            >
              <Text style={{ fontWeight: 'bold', color: isActive ? '#FFFFFF' : '#636366' }}>{time}</Text>
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
        <Text className="absolute top-[1px] text-[#636366] z-10 font-medium">Steps</Text>

        <RulerPicker
            width={width - 40}
            height={100}
            min={100}
            max={10000}
            step={10}
            initialValue={goals.steps}
            onValueChange={handleRulerChange}
            unit=""
            fractionDigits={0}
            indicatorColor="#FFFFFF"
            shortStepColor="#636366"
            longStepColor="#AFAFAF"
            indicatorHeight={40}
            longStepHeight={50}
            shortStepHeight={20}
            valueTextStyle={{
                color: '#FFFFFF',
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
              
              <TouchableOpacity 
                activeOpacity={1}
                onPressIn={() => setIsMinusPressed(true)}
                onPressOut={() => setIsMinusPressed(false)}
                onPress={decrement}
                style={{
                  width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isMinusPressed ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                  borderWidth: 1, borderColor: isMinusPressed ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                }}
              >
                <Minus color={isMinusPressed ? "black" : "white"} size={32} strokeWidth={3} />
              </TouchableOpacity>

              <View className="items-center">
                <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#FFFFFF' }}>{goals.water.toFixed(1)}</Text>
                <Text style={{ color: '#636366', fontSize: 18, marginTop: 4 }}>Liters</Text>
              </View>

              <TouchableOpacity 
                activeOpacity={1}
                onPressIn={() => setIsPlusPressed(true)}
                onPressOut={() => setIsPlusPressed(false)}
                onPress={increment}
                style={{
                  width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isPlusPressed ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                  borderWidth: 1, borderColor: isPlusPressed ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                }}
              >
                <Plus color={isPlusPressed ? "black" : "white"} size={32} strokeWidth={3} />
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
            <Text style={{ color: '#636366', fontWeight: 'bold', fontSize: 20 }}>
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
    <View style={{ flex: 1, backgroundColor: '#000' }}>
    <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
    <SafeAreaView className="flex-1 p-6 justify-between" style={{ paddingTop: 80 }}>
        <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 }}>
              {stepsConfig[currentStep].title}
            </Text>
            <Text style={{ color: '#636366', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              Set a goal based on how active you are, or how active{'\n'}you'd like to be, each day.
            </Text>
        </View>

        <View className="flex-1 justify-center items-center">
          {currentStep === 0 && renderMeditation()}
          {currentStep === 1 && renderSteps()}
          {currentStep === 2 && renderWater()}
          {currentStep === 3 && renderSleep()}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={{ width: '100%', marginBottom: 8 }}
        >
          <ImageBackground
            source={buttonBg}
            style={{ width: '100%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 18, overflow: 'hidden' }}
            imageStyle={{ borderRadius: 18 }}
            resizeMode="cover"
          >
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: 0.3 }}>
              {currentStep === stepsConfig.length - 1 ? 'Save Goals' : 'Change Goal'}
            </Text>
          </ImageBackground>
        </TouchableOpacity>
    </SafeAreaView>
    </ImageBackground>
    </View>
     );
}