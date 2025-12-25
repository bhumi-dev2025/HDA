import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// model import
import MeditationModal from '../../componunts/Modals/MeditationModel';
import StepPickerModal from '../../componunts/Modals/StepModel';
import SleepModal from '../../componunts/Modals/SleepModel';
import TaskModal from '../../componunts/Modals/TodoModel';
import WaterTrackerModal from '../../componunts/Modals/WaterModel';

// icons & components
import I5 from '../../assets/photo/home/I5.svg'
import I6 from '../../assets/photo/home/I6.svg'
import I7 from '../../assets/photo/home/I7.svg'
import I8 from '../../assets/photo/home/I8.svg'
import I9 from '../../assets/photo/home/I9.svg'
import I10 from '../../assets/photo/home/I10.svg'
import I11 from '../../assets/photo/home/I11.svg'
import I12 from '../../assets/photo/home/I12.svg'
import I13 from '../../assets/photo/home/I13.svg'
import I14 from '../../assets/photo/home/I14.svg'
import ScoreChart from '../../componunts/Score';
import C2 from '../../assets/photo/home/C2.svg'
import C1 from '../../assets/photo/home/C1.svg'

type ModalType = 'meditation' | 'water' | 'todo' | 'step' | 'sleep' | null;

export default function HomeScreen() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // States to store actual values from modals
  const [meditationData, setMeditationData] = useState('10m');
  const [waterData, setWaterData] = useState(1.5);
  const [stepData, setStepData] = useState('200');
  const [sleepData, setSleepData] = useState({ hour: '08', minute: '24' });
  const [todoTasks, setTodoTasks] = useState<{text:string,isDone:boolean}[]>([]);

  // States for visibility (Before/After)
  const [isMeditationDone, setIsMeditationDone] = useState(false);
  const [isWaterDone, setIsWaterDone] = useState(false);
  const [isTodoDone, setIsTodoDone] = useState(false);
  const [isStepDone, setIsStepDone] = useState(false);
  const [isSleepDone, setIsSleepDone] = useState(false);

  // Updated handleSave to accept value
  const handleSave = (type: ModalType, value?: any) => {
    if (type === 'meditation') {
      setMeditationData(value);
      setIsMeditationDone(true);
    }
    if (type === 'water') {
      setWaterData(value);
      setIsWaterDone(true);
    }
    if (type === 'todo') {
      setTodoTasks(value);
      setIsTodoDone(true);
    }
    if (type === 'step') {
      setStepData(value);
      setIsStepDone(true);
    }
    if (type === 'sleep') {
      setSleepData(value);
      setIsSleepDone(true);
    }
    setActiveModal(null);
  };

  const p1 = require('../../assets/photo/home/p1.png');
  const p2 = require('../../assets/photo/home/p2.png');
  const p3 = require('../../assets/photo/home/p3.png');
  const p5 = require('../../assets/photo/home/p5.png');
  const p6 = require('../../assets/photo/home/p6.png');
  const p7 = require('../../assets/photo/home/p7.png');

  return (
    <SafeAreaView className="flex-1 bg-[#F1F1F1]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

        <View className="flex-row justify-between items-center mb-6 mt-2">
          <I5 width={30} height={30} />
          <View className="w-10 h-10 bg-[#D9D9D9] rounded-full" />
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <I6 />
            <Text className="text-lg font-semibold text-[#888]">Overview</Text>
          </View>
          <Text className="text-[#888]">All →</Text>
        </View>

        <ScoreChart />

        <View className="flex-row items-center gap-2 mb-4 mt-4">
          <I7 />
          <Text className="text-lg font-semibold text-[#888]">Superhuman Elements</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">

          <TouchableOpacity className="w-[49%] bg-white p-4 rounded-2xl h-20 flex-row items-center border-3 border-white gap-2">
            <I12 />
            <Text className="text-[#333] font-bold text-lg">Good Morning</Text>
          </TouchableOpacity>

          {/* 2. Steps Card */}
          <TouchableOpacity onPress={() => setActiveModal('step')} className="w-[49%] p-4 rounded-3xl mb-4 h-24 overflow-hidden flex-row items-center border-8 border-white gap-4">
            {!isStepDone ? (
              <>
                <Image source={p2} className='absolute w-[130%] h-24' resizeMode="cover" />
                <I9 />
                <Text className="flex-1 text-[#333] font-medium text-sm">Mindful steps,{'\n'}peaceful path.</Text>
              </>
            ) : (
              <>
                <I9 />
                <View className="w-[2px] h-10 bg-gray-200" />
                <View>
                  <View className="bg-[#FFF5D6] px-2 py-0.5 rounded-full self-start mb-1">
                    <Text className="text-[#CEA021] text-[10px] font-bold">Steps</Text>
                  </View>
                  <Text className="text-[#333] text-2xl font-black">{stepData}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* 3. Meditation Card */}
          <TouchableOpacity onPress={() => setActiveModal('meditation')} className="w-[49%] p-4 rounded-3xl h-28 mt-[-15px] overflow-hidden flex-row items-center border-8 border-white gap-4">
            {!isMeditationDone ? (
              <>
                <Image source={p1} className='absolute w-[130%] h-28' resizeMode="cover" />
                <I8 />
                <Text className="text-[#333] font-medium text-sm">Mind clear. Soul{'\n'}light.</Text>
              </>
            ) : (
              <>
                <I8 />
                <View className="w-[2px] h-10 bg-gray-200" />
                <View>
                  <View className="bg-[#E6F4D7] px-2 py-0.5 rounded-full self-start mb-1">
                    <Text className="text-[#6B8E23] text-[10px] font-bold">Meditation</Text>
                  </View>
                  <Text className="text-[#333] text-2xl font-black">{meditationData}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <View className="w-[49%]">
            {/* 4. Todo Card */}
            <TouchableOpacity 
            onPress={() => setActiveModal('todo')} className="p-4 rounded-3xl mt-[-5px] mb-4 h-56 overflow-hidden justify-start items-center border-8 border-white">
              {!isTodoDone ? (<>
                <Image source={require('../../assets/photo/home/p4.png')} className='absolute w-[130%] h-52' resizeMode="cover" />
                <I11 height={50} width={50} />
                <Text className="text-[#333] text-center font-medium text-sm mb-3 mt-16">Write a small to-do list for{'\n'}Superhuman Work.</Text></>
              ) : (
                <>
                  <Image source={p7} className='absolute w-[130%] h-52' resizeMode="cover" />
                  <View className="mt-4">
                    <Text className='text-[#333] text-1xl font-black'>Things to do today</Text>
                  </View>
                  <View className='items-start p-4 mb-4'>
                    {todoTasks.filter(t => t.text !== '').map((item ,index) => (  
                      <View key={index} className='flex-row items-center gap-2 mt-2'>
                        {item.isDone ? <C2 width={18} height={18} /> : <C1 height={18} width={18}></C1>}
                        <Text numberOfLines={1} className={`text-[14px] font-semibold flex-1 ${item.isDone ? 'text-[#bbb9b9]' : 'text-[#333]'}`}>{item.text}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* 5. Sleep Card */}
            <TouchableOpacity onPress={() => setActiveModal('sleep')} className="p-4 rounded-3xl h-28 overflow-hidden flex-row items-center border-8 border-white gap-4">
              {!isSleepDone ? (
                <>
                  <Image source={p5} className='absolute w-[130%] h-28' resizeMode="cover" />
                  <I13 />
                  <Text className="text-[#333] font-medium text-sm">Quiet mind. Deep{'\n'}Sleep.</Text>
                </>
              ) : (
                <>
                  <I13 />
                  <View className="w-[2px] h-10 bg-gray-200" />
                  <View>
                    <View className="bg-[#F2F2F7] px-2 py-0.5 rounded-full self-start mb-1">
                      <Text className="text-[#333] text-[10px] font-bold">Sleep</Text>
                    </View>
                    <Text className="text-[#333] text-2xl font-black">{sleepData.hour}:{sleepData.minute}</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 6. Water Card */}
          <TouchableOpacity onPress={() => setActiveModal('water')} className="w-[49%] p-6 rounded-3xl h-60 mt-[-210px] overflow-hidden justify-between items-center border-8 border-white">
            {!isWaterDone ? (
              <>
                <Image source={p3} className='absolute w-[130%] h-60' resizeMode="cover" />
                <I10 height={50} width={50} />
                <Text className="text-[#333] text-center font-medium text-sm">Water brings life,{'\n'}health, and happiness.</Text>
              </>
            ) : (
              <>
                <Image source={p6} className='absolute w-[130%] h-60' resizeMode="cover" />
                <View className="items-center mt-2">
                  <Text className="text-[#333] text-center font-medium text-[10px] leading-3 mb-2">Water brings life,{'\n'}health, and happiness.</Text>
                  <Text className="text-[#333] text-3xl font-black">{waterData} ltr</Text>
                </View>
                <View className="mb-6"><I14 width={60} height={60} /></View>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Modals Pass Value to handleSave --- */}
      <MeditationModal
        isVisible={activeModal === 'meditation'}
        onClose={() => setActiveModal(null)}
        onSave={(val) => handleSave('meditation', val)}
      />
      <WaterTrackerModal
        visible={activeModal === 'water'}
        onClose={() => setActiveModal(null)}
        onSave={(val) => handleSave('water', val)}
      />
      <TaskModal
        visible={activeModal === 'todo'}
        onClose={() => setActiveModal(null)}
        onSave={(val) => handleSave('todo', val)}
      />
      <StepPickerModal
        isVisible={activeModal === 'step'}
        onClose={() => setActiveModal(null)}
        onSave={(val) => handleSave('step', val)}
      />
      <SleepModal
        isVisible={activeModal === 'sleep'}
        onClose={() => setActiveModal(null)}
        onSave={(val) => handleSave('sleep', val)}
      />
    </SafeAreaView>
  );
}