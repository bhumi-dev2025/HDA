import React,{useState} from 'react';
import { View, Text, ScrollView,TouchableOpacity,Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import I5 from '../../assets/photo/home/I5.svg'
import I6 from '../../assets/photo/home/I6.svg'
import I7 from '../../assets/photo/home/I7.svg'
import I8 from '../../assets/photo/home/I8.svg'
import I9 from '../../assets/photo/home/I9.svg'
import I10 from '../../assets/photo/home/I10.svg'
import I11 from '../../assets/photo/home/I11.svg'
import I12 from '../../assets/photo/home/I12.svg'
import I13 from '../../assets/photo/home/I13.svg'
import ScoreChart from '../../componunts/Score';

export default function HomeScreen() {
  const p1 = require('../../assets/photo/home/p1.png');
  const p2 = require('../../assets/photo/home/p2.png');
  const p3 = require('../../assets/photo/home/p3.png');
  const p4 = require('../../assets/photo/home/p4.png');
  const p5 = require('../../assets/photo/home/p5.png');

  const [isMeditationDone, setIsMeditationDone] = useState(false);
  const [isWaterDone, setIsWaterDone] = useState(false);
  const [isTodoDone, setIsTodoDone] = useState(false);
  const [isStepDone, setIsStepDone] = useState(false);
  const [isSleepDone, setIsSleepDone] = useState(false);

  const handleSaveData = (type: string) => {
    if (type === 'meditation') setIsMeditationDone(true);
    if (type === 'water') setIsWaterDone(true);
    if (type === 'todo') setIsTodoDone(true);
    if (type === 'step') setIsStepDone(true);
    if (type === 'sleep') setIsSleepDone(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F1F1F1]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

        {/* --- 1. Header with Lottie Animation --- */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
          {/* Logo "H" - Serif Font style */}
          <I5 width={30} height={30}></I5>
          {/* Profile Placeholder */}
          <View className="w-10 h-10 bg-[#D9D9D9] rounded-full" />
        </View>

        {/* --- 2. Recents Section --- */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <I6></I6>
            <Text className="text-lg font-semibold text-[#888]">Overview</Text>
          </View>
          <Text className="text-[#888]">All →</Text>
        </View>

        {/* Recents Scroll */}
              <View>
                <ScoreChart></ScoreChart>
              </View>

        {/* --- 4. Easels & Notes Section --- */}
        <View className="flex-row items-center gap-2 mb-4">
          <I7></I7>
          <Text className="text-lg font-semibold text-[#888]">Superhuman Elements</Text>
        </View>

        {/* Main Container */}
        <View className="flex-row flex-wrap justify-between">
          
          {/* 1. Good Morning Card (Bottom Left - spans width or stays small) */}
          <TouchableOpacity className="w-[49%] bg-white p-4 rounded-2xl h-20 overflow-hidden flex-row items-center border-3 border-[white] gap-2 ">
             <I12></I12>
             <Text className="text-[#333] font-bold text-lg">Good Morning</Text>
          </TouchableOpacity>

          {/* 2. Mindful Steps (Top Right) */}
          <TouchableOpacity className="w-[49%] p-5 rounded-3xl mb-4 h-24 overflow-hidden justify-center flex-row items-center border-separate border-8 border-[white] gap-4">
            <Image source={p2} className='absolute w-[130%] h-24' resizeMode="cover"/>
            <I9></I9>
            <Text className="flex-1 text-[#333] font-medium text-sm">Mindful steps, peaceful path.</Text>
          </TouchableOpacity>

          {/* 3. Mind Clear Card (Top Left) */}
          <TouchableOpacity className="w-[49%] p-2 rounded-3xl h-28 mt-[-15px] overflow-hidden justify-center flex-row items-center border-separate border-8 border-[white] gap-4">
             <Image source={p1} className='absolute w-[130%] h-28' resizeMode="cover"/>
              <I8></I8>
            <Text className="text-[#333] font-medium text-sm">Mind clear. Soul{"\n"}light.</Text>
          </TouchableOpacity>

          {/* Column for Right side items (To-Do and Sleep) */}
          <View className="w-[49%]">
            
            {/* 4. To-Do List Card */}
            <TouchableOpacity className="p-4 rounded-3xl mt-[-5px] mb-4 h-56 overflow-hidden justify-between items-center border-separate border-8 border-[white]">
                <Image source={p4} className='absolute w-[130%] h-52' resizeMode="cover"/>
                <I11 height={50} width={50}></I11>
                <Text className="text-[#333] text-center font-medium text-sm mb-3">
                  Write a small to-do list{"\n"} for Superhuman Work.
                </Text>
            </TouchableOpacity>

            {/* 5. Quiet Mind / Sleep Card */}
            <TouchableOpacity className="p-5 rounded-3xl h-28 overflow-hidden flex-row items-center border-separate border-8 border-[white] gap-4">
              <Image source={p5} className='absolute w-[130%] h-28' resizeMode="cover"/>
              <I13></I13>
              <Text className="text-[#333] font-medium text-sm">Quit mind. Deep{"\n"}Sleep.</Text>
          </TouchableOpacity>
          </View>

          {/* 6. Water Card (Large Left) */}
          <TouchableOpacity className="w-[49%] p-6 rounded-3xl h-60 mt-[-210px] overflow-hidden justify-between items-center border-separate border-8 border-[white]">
            <Image source={p3} className='absolute w-[130%] h-60' resizeMode="cover"/>
            <I10 height={50} width={50}></I10>
            <Text className="text-[#333] text-center font-medium text-sm mb-2">Water brings life,{"\n"}health, and happiness.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
