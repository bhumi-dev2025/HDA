import React, { useState,useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Aa import tamari file ma upar add karo
import { updateDailyLog, getTodayLog,getUserProfile } from '../../lib/TrackerService';

// model import
import MeditationModal from '../../componunts/Modals/MeditationModel';
import StepPickerModal from '../../componunts/Modals/StepModel';
import SleepModal from '../../componunts/Modals/SleepModel';
import TaskModal from '../../componunts/Modals/TodoModel';
import WaterTrackerModal from '../../componunts/Modals/WaterModel';

// icons & components
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
import L1 from '../../assets/photo/home/L1.svg'

type ModalType = 'meditation' | 'water' | 'todo' | 'step' | 'sleep' | null;
// Type define karo jethi error na aave
type ModalData = string | number | { hour: string; minute: string } | { text: string; isDone: boolean }[];
export default function HomeScreen() {
  // બીજા States ની સાથે આ પણ લખો
const [userPhoto, setUserPhoto] = useState<string | null>(null); //photo
  const [currentScore, setCurrentScore] = useState(0); // Score mate navu state
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
  // Updated handleSave function
  const handleSave = async (type: ModalType, value: ModalData) => {
    // A. Local UI update (Jem che tem j rakhvu)
    if (type === 'meditation'&& typeof value === 'string') { setMeditationData(value); setIsMeditationDone(true); }
    if (type === 'water'&& typeof value === 'number') { setWaterData(value); setIsWaterDone(true); }
    if (type === 'todo'&& Array.isArray(value)) { setTodoTasks(value); setIsTodoDone(true); }
    if (type === 'step'&& typeof value === 'string') { setStepData(value); setIsStepDone(true); }
    if (type === 'sleep'&& typeof value === 'object'&&'hour'in value) { setSleepData(value as {hour:string; minute: string}); setIsSleepDone(true); }

    setActiveModal(null); // Modal bandh thay che

    // --- SUDHARO AHIYA CHE (FIX) ---
    // Check karo ke 'type' null nathi, pachi j backend call karo
    if (type) {
        console.log("Saving to Supabase:", type);
        const result = await updateDailyLog(type, value);

        if (result.success && result.newScore !== undefined) {
             // Score update logic
             // Note: Tamare 'setCurrentScore' state banavyu hase to ahi set karo
             setCurrentScore(result.newScore); 
        }
    }
};

  const p1 = require('../../assets/photo/home/p1.png');
  const p2 = require('../../assets/photo/home/p2.png');
  const p3 = require('../../assets/photo/home/p3.png');
  const p5 = require('../../assets/photo/home/p5.png');
  const p6 = require('../../assets/photo/home/p6.png');
  const p7 = require('../../assets/photo/home/p7.png');

  // Aa useEffect add karo - App khule etle data lavse
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getTodayLog();
    if (data) {
        if(data.score) setCurrentScore(data.score);
        
        // UI states update kariye jethi user ne dekhay
        if(data.meditation_time) { setMeditationData(data.meditation_time); setIsMeditationDone(true); }
        if(data.water_intake) { setWaterData(data.water_intake); setIsWaterDone(true); }
        if(data.step_count) { setStepData(data.step_count.toString()); setIsStepDone(true); }
        if(data.sleep_data) { setSleepData(data.sleep_data); setIsSleepDone(true); }
        if(data.todo_list) { setTodoTasks(data.todo_list); setIsTodoDone(true); }
    }
    //photo
    const photoUrl = await getUserProfile();
    if (photoUrl) {
        setUserPhoto(photoUrl);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F1F1F1]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

        <View className="flex-row justify-between items-center mb-6 mt-2">
          <L1 width={30} height={30} />
          {userPhoto ? (
    <Image 
      source={{ uri: userPhoto }} 
      className="w-12 h-12 rounded-full border-2 border-gray-500"
    />
  ) : (
    <View className="w-12 h-12 bg-[#D9D9D9] rounded-full" />
  )}
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <I6 />
            <Text className="text-lg font-semibold text-[#888]">Superhuman Score</Text>
          </View>
        </View>

        <ScoreChart score={currentScore} />

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
                <Image source={p2} className='absolute w-[130%] h-24' resizeMode="cover" />
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
                <Image source={p1} className='absolute w-[130%] h-28' resizeMode="cover" />
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
            onPress={() => setActiveModal('todo')} className="p-4 rounded-3xl mt-[-5px] mb-4 h-56 overflow-hidden items-center border-8 border-white">
              {!isTodoDone ? (<>
                <Image source={require('../../assets/photo/home/p4.png')} className='absolute w-[130%] h-52' resizeMode="cover" />
                {/* </View> */}
                <I11 height={50} width={50} className='items-center' />
                <Text className="text-[#333] text-center font-medium text-sm mb-3 mt-16">Write a small to-do list for{'\n'}Superhuman Work.</Text></>
                
              ) : (
                <>
                  <Image source={p7} className='absolute w-[130%] h-52' resizeMode="cover" />
                  <View className="items-start">
                    <Text className='text-[#333] text-1xl font-black mt-4'>Things to do today</Text>
                  
                  <View className='items-center justify-start mb-4 gap-1 mt-4'>
                    {todoTasks.filter(t => t.text !== '').map((item ,index) => (  
                      <View key={index} className='flex-row items-center gap-2 mt-2'>
                        {item.isDone ? <C2 width={18} height={18} /> : <C1 height={18} width={18}></C1>}
                        <Text numberOfLines={1} className={`text-[14px] font-semibold flex-1 ${item.isDone ? 'text-[#bbb9b9]' : 'text-[#333]'}`}>{item.text}</Text>
                      </View>
                    ))}
                  </View>
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
                  <Image source={p5} className='absolute w-[130%] h-28' resizeMode="cover" />
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