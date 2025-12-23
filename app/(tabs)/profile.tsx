import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import I5 from '../../assets/photo/home/I5.svg'
import I6 from '../../assets/photo/home/I6.svg'
import I7 from '../../assets/photo/home/I7.svg'
import I8 from '../../assets/photo/home/I8.svg'
import I9 from '../../assets/photo/home/I9.svg'
import I12 from '../../assets/photo/home/I12.svg'
import I13 from '../../assets/photo/home/I13.svg'
import I14 from '../../assets/photo/home/I14.svg'
import C1 from '../../assets/photo/home/C1.svg'
import C2 from '../../assets/photo/home/C2.svg'
import ScoreChart from '../../componunts/Score';

const task = [
   {id:1,task:'ui design for app',done:true},
   {id:2,task:'create ux for fittech app',done:true},
   {id:3,task:'colse tikit forui and\n meeting with team',done:false}
]


export default function HomeScreen() {
   const p6 = require('../../assets/photo/home/p6.png');
   const p7 = require('../../assets/photo/home/p7.png');

   const [isMeditationDone, setIsMeditationDone] = useState(false);
   const [isWaterDone, setIsWaterDone] = useState(false);
   const [isTodoDone, setIsTodoDone] = useState(false);
   const [isStepDone, setIsStepDone] = useState(false);
   const [isSleepDone, setIsSleepDone] = useState(false);
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
               <TouchableOpacity className="w-[49%] p-2 rounded-3xl mb-4 h-24 overflow-hidden justify-center flex-row items-center border-separate border-8 border-[white] gap-4">
                  <I9></I9>
                  <View className="w-[2px] h-10 bg-gray-200 mr-3" />
                  <View>
                     <View className="bg-[#FFF5D6] px-2 py-0.5 rounded-full self-start mb-1">
                        <Text className="text-[#CEA021] text-[10px] font-bold">Steps</Text>
                     </View>
                     <Text className="text-[#333] text-2xl font-black">2796</Text>
                  </View>
               </TouchableOpacity>

               {/* 3. Mind Clear Card (Top Left) */}
               <TouchableOpacity className="w-[49%] p-4 rounded-3xl h-28 mt-[-15px]  overflow-hidden justify-center border-separate border-8 border-[white] flex-row items-center gap-2">
                  <I8></I8>
                  <View className="w-[2px] h-10 bg-gray-200 mr-3" />
                  <View>
                     <View className="bg-[#E6F4D7] px-2 py-0.5 rounded-full self-start mb-1">
                        <Text className="text-[#6B8E23] text-[10px] font-bold">Meditation</Text>
                     </View>
                     <Text className="text-[#333] text-2xl font-black">10m</Text>
                  </View>
               </TouchableOpacity>

               

               {/* Column for Right side items (To-Do and Sleep) */}
               <View className="w-[49%]">

                  {/* 4. To-Do List Card */}
                  <TouchableOpacity className=" p-4 rounded-3xl mt-[-5px] mb-4 h-56 overflow-hidden justify-between items-center border-separate border-8 border-[white]">
                     <Image source={p7} className='absolute w-[130%] h-52' resizeMode="cover"/>
                     <View className="items-start mt-4">
                        <Text className='text-[#333] text-1xl font-black'>Things to do today</Text>
                     </View>
                     <View className='items-start mb-4'>
                        {task.map((item, index) =>(
                           <View key={index} className='flex-row items-start gap-2 mt-2'>
                              {item.done ? (<C2></C2>) : (<C1></C1>)}
                              {item.done ? (<Text className='text-[#bbb9b9] text-[10px] font-medium'>{item.task}</Text>) : (
                              <Text className='text-[#333] text-[10px] font-medium'>{item.task}</Text>)}
                           </View>
                        ))}
                     </View>
                  </TouchableOpacity>

                  {/* 5. Quiet Mind / Sleep Card */}
                  <TouchableOpacity className="p-2 rounded-3xl h-28 overflow-hidden flex-row items-center justify-center border-separate border-8 border-[white] gap-4">
                     <I13></I13>
                     <View className="w-[2px] h-10 bg-gray-200" mr-3 />
                     <View>
                        <View className="bg-[#F2F2F7] px-2 py-0.5 rounded-full self-start mb-1">
                           <Text className="text-[#333] text-[10px] font-bold">Sleep</Text>
                        </View>
                        <Text className="text-[#333] text-2xl font-black">8:20</Text>
                     </View>
                  </TouchableOpacity>
               </View>
            
               {/* 6. Water Card (Large Left) */}
               <TouchableOpacity className="w-[49%] p-6 rounded-3xl mt-[-210px] h-60 overflow-hidden justify-between items-center border-separate border-8 border-[white]">
                  <Image source={p6} className='absolute w-[130%] h-60' resizeMode="cover"/>
                  <View className="items-center mt-2">
                     <Text className="text-[#333] text-center font-medium text-[10px] leading-3 mb-2">
                        Water brings life, health,{"\n"}and happiness.
                     </Text>
                     <Text className="text-[#333] text-3xl font-black">1.5ltr</Text>
                  </View>
                  <View className="mb-6">
                     <I14 width={60} height={60} />
                  </View>
               </TouchableOpacity>
               
            </View>
         </ScrollView>
         
      </SafeAreaView>
   );
}
