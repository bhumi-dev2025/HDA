import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//back end functions call....
import { updateDailyLog, getTodayLog} from '../../lib/TrackerService';
import { useRouter } from 'expo-router';
// import LottieView from 'lottie-react-native'; 


// model import
import MeditationModal from '../../componunts/Modals/MeditationModel';
import StepPickerModal from '../../componunts/Modals/StepModel';
import SleepModal from '../../componunts/Modals/SleepModel';
import TaskModal from '../../componunts/Modals/TodoModel';
import WaterTrackerModal from '../../componunts/Modals/WaterModel';
import WorkoutModal from '../../componunts/Modals/WorkoutModel';
import ScoreChart from '../../componunts/Score';

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
import I16 from '../../assets/photo/home/I16.svg'
import C2 from '../../assets/photo/home/C2.svg'
import C1 from '../../assets/photo/home/C1.svg'
import L1 from '../../assets/photo/home/L1.svg'
import A1 from '../../assets/photo/home/A1.svg'

//interface ..
type ModalType = 'meditation' | 'water' | 'todo' | 'step' | 'sleep' | 'workout'| null;
type ModalData = string | number | { hour: string; minute: string } | { text: string; isDone: boolean }[];
interface CardProps {
  children: React.ReactNode;      // બાળકો (ટેક્સ્ટ, ઈમેજ વગેરે)
  onPress?: () => void;           // ક્લિક ફંક્શન (Optional - ? મુક્યું છે)
  heightClass?: string;           // હાઈટ ક્લાસ (Optional)
  className?: string;             // એક્સ્ટ્રા સ્ટાઈલ (Optional)
}

 //image of cards background
  const p1 = require('../../assets/photo/home/p1.png');
  const p2 = require('../../assets/photo/home/p2.png');
  const p3 = require('../../assets/photo/home/p3.png');
  const p4 = require('../../assets/photo/home/p4.png');
  const p5 = require('../../assets/photo/home/p5.png');
  const p6 = require('../../assets/photo/home/p6.png');
  const p7 = require('../../assets/photo/home/p7.png');
  const p8 = require('../../assets/photo/home/p8.png');

  const CardContainer = ({ children, onPress, heightClass = "h-auto", className = "" }: CardProps) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      // જો onPress ના હોય તો ક્લિક ડિસેબલ થઈ જાય (optional)
      disabled={!onPress}
      className={`w-full rounded-3xl overflow-hidden border-4 border-white relative ${heightClass} ${className}`}
    >
      {children}
    </TouchableOpacity>
  );

export default function HomeScreen() {
  const router = useRouter();
  // const [userPhoto, setUserPhoto] = useState<string | null>(null); //photo
  const [currentScore, setCurrentScore] = useState(0); // Score mate navu state
  const [activeModal, setActiveModal] = useState<ModalType>(null); //modal active...

  // States to store actual values from modals
  const [meditationData, setMeditationData] = useState('10m');
  const [waterData, setWaterData] = useState(1.5);
  const [stepData, setStepData] = useState('200');
  const [sleepData, setSleepData] = useState({ hour: '08', minute: '24' });
  const [todoTasks, setTodoTasks] = useState<{ text: string, isDone: boolean }[]>([]);
  const [workoutData, setWorkoutData] = useState({ hour: '00', minute: '30' });

  // States for visibility (Before/After)
  const [isMeditationDone, setIsMeditationDone] = useState(false);
  const [isWaterDone, setIsWaterDone] = useState(false);
  const [isTodoDone, setIsTodoDone] = useState(false);
  const [isStepDone, setIsStepDone] = useState(false);
  const [isSleepDone, setIsSleepDone] = useState(false);
  const [isWorkoutDone, setIsWorkoutDone] = useState(false);

  // Updated handleSave to accept value
  // Updated handleSave function
  const handleSave = async (type: ModalType, value: ModalData) => {
    // A. Local UI update
    if (type === 'meditation' && typeof value === 'string') { setMeditationData(value); setIsMeditationDone(true); }
    if (type === 'water' && typeof value === 'number') { setWaterData(value); setIsWaterDone(true); }
    if (type === 'todo' && Array.isArray(value)) { setTodoTasks(value); setIsTodoDone(true); }
    if (type === 'step' && typeof value === 'string') { setStepData(value); setIsStepDone(true); }
    if (type === 'sleep' && typeof value === 'object' && 'hour' in value) { setSleepData(value as { hour: string; minute: string }); setIsSleepDone(true); }
    if (type === 'workout' && typeof value === 'object' && 'hour' in value) { setWorkoutData(value as { hour: string; minute: string }); setIsWorkoutDone(true); }

    setActiveModal(null); // Modal close

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
 

  // Aa useEffect -> data load (open app)
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getTodayLog();
    if (data) {
      if (data.score) setCurrentScore(data.score);

      // UI states update kariye jethi user ne dekhay
      if (data.meditation_time) { setMeditationData(data.meditation_time); setIsMeditationDone(true); }
      if (data.water_intake) { setWaterData(data.water_intake); setIsWaterDone(true); }
      if (data.step_count) { setStepData(data.step_count.toString()); setIsStepDone(true); }
      if (data.sleep_data) { setSleepData(data.sleep_data); setIsSleepDone(true); }
      if (data.todo_list) { setTodoTasks(data.todo_list); setIsTodoDone(true); }
      if (data.workout_time) { setWorkoutData(data.workout_time); setIsWorkoutDone(true);
    }
  }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F1F1F1]">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      

        {/* Header Section */}
        <View className="flex-row justify-between items-center px-5 py-4">
          <L1 width={30} height={30} />
         
            <TouchableOpacity className="w-12 h-12 items-center justify-center rounded-full" onPress={()=>router.push('/settings')}>
              <A1 height={30} width={30} />
            </TouchableOpacity>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

        {/* Score Section */}
        <View className="flex-row items-center gap-2 mb-4">
          <I6 />
          <Text className="text-lg font-semibold text-[#888]">Superhuman Score</Text>
        </View>
        <ScoreChart score={currentScore} />

        {/* Elements Header */}
        <View className="flex-row items-center gap-2 mb-4 mt-6">
          <I7 />
          <Text className="text-lg font-semibold text-[#888]">Superhuman Elements</Text>
        </View>

        {/* --- MAIN GRID LAYOUT (RESPONSIVE) --- */}
        <View className="flex-row justify-between gap-3">

          {/* LEFT COLUMN (ડાબી બાજુના કાર્ડ્સ) */}
          <View className="flex-1 gap-3">

            {/* 1. Good Morning Card */}
            {/* <CardContainer heightClass="h-20" className="bg-white flex-row items-center p-4 gap-1"> */}
              {/* Background Image if needed, else plain white */}
              {/* <I12 /> */}
                      {/* <LottieView
                        // TAMARE AHIYA TAMARI FILE NO PATH AAPVO
                        source={require('../../assets/lottie/moring.json')} 
                        autoPlay
                        loop
                        renderMode="SOFTWARE" // renderMode="HARDWARE"
                        //  renderMode="HARDWARE"
                        style={{ width:30, height:30}}
                        resizeMode="contain" // athva 'cover'
                      /> */}
                    
              {/* <Text className="text-[#333] text-center font-bold text-lg flex-1">Good Morning</Text> */}
            {/* </CardContainer> */}

            {/* 1. Meditation Card */}
            <CardContainer onPress={() => setActiveModal('meditation')} heightClass="h-28" className=''>
              <Image source={p1} className="absolute w-full h-full" resizeMode="cover" />
              <View className="p-4 h-full flex-row items-center gap-4">
                {!isMeditationDone ? (
                  <>
                    <I8 />
                    <Text className="text-[#333] font-medium text-sm">Mind clear. Soul{'\n'}light.</Text>
                  </>
                ) : (
                  <>
                    <I8 height={45} width={45} />
                    <View className="w-[2px] h-10 bg-gray-200" />
                    <View>
                      <View className="bg-[#E6F4D7] px-2 py-0.5 rounded-full self-start mb-1">
                        <Text className="text-[#6B8E23] text-[10px] font-bold">Meditation</Text>
                      </View>
                      <Text className="text-[#333] text-2xl font-black">{meditationData}</Text>
                    </View>
                  </>
                )}
              </View>
            </CardContainer>

                        {/* 2. Workout Card */}
            <CardContainer onPress={() => setActiveModal('workout')} heightClass="h-24">
              <Image source={p8} className="absolute w-full h-full" resizeMode="cover" />
              <View className="p-4 h-full flex-row items-center gap-4">
                {!isWorkoutDone ? (
                  <>
                    <I16 height={40} width={40} />
                    <Text className="text-[#333] font-medium text-sm">Strength built in{'\n'}Stillness.</Text>
                  </>
                ) : (
                  <>
                    <I16 height={40} width={40} />
                    <View className="w-[2px] h-10 bg-gray-200" />
                    <View>
                      <View className="bg-[#DFE3FF] px-2 py-0.5 rounded-full self-start mb-1">
                        <Text className="text-[#1E33BD] text-[8px] font-bold">Workout</Text>
                      </View>
                      <Text className="text-[#333] text-2xl font-black">{workoutData.hour}:{workoutData.minute}</Text>
                    </View>
                  </>
                )}
              </View>
            </CardContainer>

            {/* 3. Water Card (Tall Card on Left) */}
            <CardContainer onPress={() => setActiveModal('water')} heightClass="h-56">
              {!isWaterDone ? (
                <>
                  <Image source={p3} className="absolute w-full h-full" resizeMode="cover" />
                  <View className="p-4 items-center justify-between h-full py-6">
                    <I10 height={50} width={50} />
                    <Text className="text-[#333] text-center font-medium text-sm">Water brings life,health,{'\n'} and happiness.</Text>
                  </View>
                </>
              ) : (
                <>
                  <Image source={p6} className="absolute w-full h-full" resizeMode="cover" />
                  <View className="p-4 items-center justify-center h-full py-6 gap-3">
                    <View className="items-center">
                      <Text className="text-[#333] text-center font-medium text-[10px] leading-3 mb-2">Water brings life,health,{'\n'} and happiness.</Text>
                      <Text className="text-[#333] text-3xl font-black">{waterData} ltr</Text>
                    </View>
                    <I14 width={60} height={60} />
                  </View>
                </>
              )}
            </CardContainer>

          </View>

          {/* RIGHT COLUMN (જમણી બાજુના કાર્ડ્સ) */}
          <View className="flex-1 gap-3">

            {/* 1. Steps Card */}
            <CardContainer onPress={() => setActiveModal('step')} heightClass="h-24">
              <Image source={p2} className="absolute w-full h-full" resizeMode="cover" />
              <View className="p-4 h-full flex-row items-center gap-4">
                {!isStepDone ? (
                  <>
                    <I9 height={40} width={40} />
                    <Text className="flex-1 text-[#333] font-medium text-sm">Mindful steps,{'\n'}peaceful path.</Text>
                  </>
                ) : (
                  <>
                    <I9 height={40} width={40} />
                    <View className="w-[2px] h-10 bg-gray-200" />
                    <View>
                      <View className="bg-[#FFF5D6] px-2 py-0.5 rounded-full self-start mb-1">
                        <Text className="text-[#CEA021] text-[10px] font-bold">Steps</Text>
                      </View>
                      <Text className="text-[#333] text-2xl font-black">{stepData}</Text>
                    </View>
                  </>
                )}
              </View>
            </CardContainer>

            {/* 2. Todo Card (Tall Card on Right) */}
            <CardContainer onPress={() => setActiveModal('todo')} heightClass="h-56" className='items-center justify-center'>
              {!isTodoDone ? (
                <>
                  <Image source={p4} className="absolute w-full h-full" resizeMode="cover" />
                  <View className="p-4 items-center justify-between h-full">
                    <I11 height={50} width={50} />
                    <Text className="text-[#333] text-center font-medium text-sm mb-2">Write a small to-do list for Superhuman Work.</Text>
                  </View>
                </>
              ) : (
                <>
                  <Image source={p7} className="absolute w-full h-full" resizeMode="cover" />
                  <View className="p-4 items-start">
                    <Text className='text-[#333] text-1xl font-black mt-4'>Things to do today</Text>
                    <View className='items-center justify-start mb-4 mt-4'>
                      {todoTasks.filter(t => t.text !== '').slice(0, 5).map((item, index) => (
                        <View key={index} className='flex-row items-center gap-2 mt-2'>
                          {item.isDone ? <C2 width={18} height={18} /> : <C1 height={18} width={18} />}
                          <Text numberOfLines={1} className={`text-[13px] font-semibold flex-1 ${item.isDone ? 'text-[#bbb9b9] line-through' : 'text-[#333]'}`}>{item.text}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </CardContainer>

            {/* 3. Sleep Card */}
            <CardContainer onPress={() => setActiveModal('sleep')} heightClass="h-28">
              <Image source={p5} className="absolute w-full h-full" resizeMode="cover" />
              <View className="p-4 h-full flex-row items-center gap-4">
                {!isSleepDone ? (
                  <>
                    <I13 height={40} width={40} />
                    <Text className="text-[#333] font-medium text-sm">Quiet mind. Deep{'\n'}Sleep.</Text>
                  </>
                ) : (
                  <>
                    <I13 height={40} width={40} />
                    <View className="w-[2px] h-10 bg-gray-200" />
                    <View>
                      <View className="bg-[#F2F2F7] px-2 py-0.5 rounded-full self-start mb-1">
                        <Text className="text-[#333] text-[10px] font-bold">Sleep</Text>
                      </View>
                      <Text className="text-[#333] text-2xl font-black">{sleepData.hour}:{sleepData.minute}</Text>
                    </View>
                  </>
                )}
              </View>
            </CardContainer>

          </View>
        </View>

      </ScrollView>

      {/* Modals code same as before... */}
      <MeditationModal isVisible={activeModal === 'meditation'} onClose={() => setActiveModal(null)} onSave={(val) => handleSave('meditation', val)} initialValue={meditationData}/>
      <WaterTrackerModal visible={activeModal === 'water'} onClose={() => setActiveModal(null)} onSave={(val) => handleSave('water', val)} initialValue={waterData}/>
      <TaskModal visible={activeModal === 'todo'} onClose={() => setActiveModal(null)} onSave={(val) => handleSave('todo', val)} initialTasks={todoTasks} />
      <StepPickerModal isVisible={activeModal === 'step'} onClose={() => setActiveModal(null)} onSave={(val) => handleSave('step', val)} initialValue={stepData}/>
      <SleepModal isVisible={activeModal === 'sleep'} onClose={() => setActiveModal(null)} onSave={(val) => handleSave('sleep', val)} initialValue={sleepData}/>
      <WorkoutModal isVisible={activeModal === 'workout'} onClose={() => setActiveModal(null)} onSave={(val) => handleSave('workout', val)} initialValue={workoutData}/>
    </SafeAreaView>
  );
  }
