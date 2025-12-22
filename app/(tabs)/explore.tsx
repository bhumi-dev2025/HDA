import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
// સાચું ઈમ્પોર્ટ (તમારી ઈમેજ મુજબ)
import { InfiniteWheelPicker } from 'react-native-infinite-wheel-picker';

const hoursData = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutesData = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

const SleepTrackerModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('24');

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <View className="bg-white rounded-t-[45px] items-center p-6 h-[72%] shadow-2xl">
          <View className="w-10 h-1.5 bg-gray-200 rounded-full mb-6" />

          {/* Header Section */}
          <View className="items-center mb-4 w-full relative">
            <Text className="text-black font-bold text-lg z-10">Insights</Text>
            <Text className="text-gray-100 text-[85px] font-black absolute -top-5 uppercase opacity-70 tracking-tighter">Sleep</Text>
          </View>

          {/* Icon Preview */}
          <View className="mt-16 mb-8 items-center">
             <Text className="text-8xl">🌙</Text> 
             <Text className="text-gray-400 mt-4 text-xs font-medium tracking-widest">{hour}h:{minute}m</Text>
          </View>

          {/* THE PICKER BOX (Ruler Design) */}
          <View className="w-full bg-white rounded-[35px] py-4 flex-row justify-center items-center relative shadow-sm border border-gray-100">
            
            {/* Left Ruler Lines */}
            <View className="absolute left-6">
              {[...Array(9)].map((_, i) => (
                <View key={i} className={`h-[1px] bg-gray-200 mb-2 ${i === 4 ? 'w-8 bg-gray-400' : 'w-5'}`} />
              ))}
            </View>

            {/* Hours Infinite Picker */}
            <View className="flex-row items-center">
              <InfiniteWheelPicker
                data={hoursData}
                initialSelectedIndex={8}
                elementHeight={50}
                infiniteScroll={true}
                onChangeValue={(value:any) => setHour(value)}
                containerStyle={{ width: 80, height: 150 }}
                elementTextStyle={{ fontSize: 28, fontWeight: 'bold', color: '#D1D5DB' }}
                selectedLayoutStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}
              />
              <Text className="text-3xl font-bold text-black ml-1">h</Text>
            </View>

            <Text className="text-3xl font-bold text-black mx-4">:</Text>

            {/* Minutes Infinite Picker */}
            <View className="flex-row items-center">
              <InfiniteWheelPicker
                data={minutesData}
                initialSelectedIndex={24}
                elementHeight={50}
                infiniteScroll={true}
                onChangeValue={(value:any) => setMinute(value)}
                containerStyle={{ width: 80, height: 150 }}
                elementTextStyle={{ fontSize: 28, fontWeight: 'bold', color: '#D1D5DB' }}
                selectedLayoutStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}
              />
              <Text className="text-3xl font-bold text-black ml-1">m</Text>
            </View>

            {/* Right Ruler Lines */}
            <View className="absolute right-6 items-end">
              {[...Array(9)].map((_, i) => (
                <View key={i} className={`h-[1px] bg-gray-200 mb-2 ${i === 4 ? 'w-8 bg-gray-400' : 'w-5'}`} />
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={onClose} className="bg-black w-full py-5 rounded-2xl items-center absolute bottom-10 mx-6">
            <Text className="text-white text-lg font-bold">Save</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default SleepTrackerModal;