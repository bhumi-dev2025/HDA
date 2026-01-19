import React, { useState } from 'react';
import { View, Text } from 'react-native';
import WheelPicker from 'react-native-wheel-picker-expo';
// import * as Haptics from 'expo-haptics';

// ડેટા જનરેટ કરવા માટે
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

interface CustomTimePickerProps {
    onTimeChange: (hour: string, minute: string) => void;
    initialHour?: string;   
    initialMinute?: string; 
}
const CustomTimePicker = ({ onTimeChange,initialHour = '08',initialMinute = '24' }: CustomTimePickerProps) => {
    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);

    const startHourIndex = HOURS.indexOf(initialHour);
    const startMinuteIndex = MINUTES.indexOf(initialMinute);
    // જ્યારે કલાક બદલાય
    const handleHourChange = (selectedHour: string) => {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setHour(selectedHour);
        onTimeChange(selectedHour, minute); // પેરેન્ટને નવી વેલ્યુ મોકલો
    };

    // જ્યારે મિનિટ બદલાય
    const handleMinuteChange = (selectedMinute: string) => {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setMinute(selectedMinute);
        onTimeChange(hour, selectedMinute); // પેરેન્ટને નવી વેલ્યુ મોકલો
    };

    return (
        <View className="w-[100%] h-40 flex-row items-center justify-center bg-white overflow-hidden p-2 m-6 rounded-[20px] border-8 border-gray-100 shadow-lg shadow-slate-400">
            {/* <Image source={p1} className='absolute' resizeMode="cover"/> */}
            <View className="absolute left-0 h-full justify-around">
                {[...Array(11)].map((_, index) => {
                    const isLongLine = index % 5 === 0;

                    return (
                        <View
                            key={index}
                            className={`${isLongLine ? 'w-6 bg-gray-300' : 'w-3 bg-gray-100'} h-[1.5px]`}
                        />
                    );
                })}
            </View>
            {/* Hours Wheel */}
            <View className="flex-row items-center">
                <WheelPicker
                    initialSelectedIndex={startHourIndex !== -1 ? startHourIndex : 0}
                    items={HOURS.map(h => ({ label: h, value: h }))}
                    onChange={({ item }) => handleHourChange(item.value)}
                    height={250}
                    width={80}
                    flatListProps={{
                        nestedScrollEnabled: true, // એન્ડ્રોઇડ પર સ્મૂધનેસ માટે
                        windowSize: 3,         
                    }}
                />
                <Text className="text-3xl font-bold ml-2">h</Text>
            </View>

            <Text className="text-3xl font-bold mx-4">:</Text>

            {/* Minutes Wheel */}
            <View className="flex-row items-center">
                <WheelPicker
                    initialSelectedIndex={startMinuteIndex !== -1 ? startMinuteIndex : 0}
                    items={MINUTES.map(m => ({ label: m, value: m }))}
                    onChange={({ item }) => handleMinuteChange(item.value)}
                    height={250}
                    width={80}
                    flatListProps={{
                        nestedScrollEnabled: true, // એન્ડ્રોઇડ પર સ્મૂધનેસ માટે
                        windowSize: 3,     
                    }}
                />
                <Text className="text-3xl font-bold ml-2">m</Text>
            </View>
            <View className="absolute right-0 h-full justify-around items-end">
                {[...Array(11)].map((_, index) => {
                    // દર 5મી લાઈન (0, 5, 10, 15) મોટી રાખવા માટે
                    const isLongLine = index % 5 === 0;

                    return (
                        <View
                            key={`right-${index}`}
                            className={`${isLongLine ? 'w-6 bg-gray-300' : 'w-3 bg-gray-200'
                                } h-[1.5px]`}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default CustomTimePicker;
