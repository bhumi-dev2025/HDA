import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// આ ટાઈપ્સ છે જે આપણે નીચે વાપરીશું
type UnitOption = string;

interface UnitSectionProps {
  title: string;
  options: UnitOption[];
  selected: UnitOption;
  onSelect: (option: UnitOption) => void;
}

// 1. Reusable Section Component
// આ કમ્પોનન્ટ લિસ્ટ અને હેડિંગને રેન્ડર કરશે
const UnitSection: React.FC<UnitSectionProps> = ({ title, options, selected, onSelect }) => {
  return (
    <View className="mb-6">
      {/* Section Title */}
      <Text className="text-base font-bold text-black mb-3 ml-1">
        {title}
      </Text>
      
      {/* Options Container */}
      <View className="bg-white rounded-2xl overflow-hidden">
        {options.map((option, index) => {
          const isSelected = selected === option;
          const isLast = index === options.length - 1;

          return (
            <TouchableOpacity
              key={option}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
              className={`flex-row justify-between items-center p-4 ${
                !isLast ? 'border-b border-gray-100' : ''
              }`}
            >
              <Text className="text-base text-gray-900 font-medium">
                {option}
              </Text>
              
              {/* Checkmark Icon only if selected */}
              {isSelected && (
                <Check size={20} color="black" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// 2. Main Screen Component
export default function UnitOfMeasureScreen() {
  // State variables for each category
  const [meditationUnit, setMeditationUnit] = useState<string>('Minutes');
  const [stepsUnit, setStepsUnit] = useState<string>('Steps');
  const [waterUnit, setWaterUnit] = useState<string>('Liter');
  const [sleepUnit, setSleepUnit] = useState<string>('Hours');

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] p-6">
        {/* Scrollable Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <UnitSection
            title="Meditation Units"
            options={['Minutes', 'Hours']}
            selected={meditationUnit}
            onSelect={setMeditationUnit}
          />

          <UnitSection
            title="Steps Units"
            options={['Steps', 'Kilometers']}
            selected={stepsUnit}
            onSelect={setStepsUnit}
          />

          <UnitSection
            title="Water Units"
            options={['Liter', 'Bottle or Glass']}
            selected={waterUnit}
            onSelect={setWaterUnit}
          />

          <UnitSection
            title="Sleep Time Units"
            options={['Minutes', 'Hours']}
            selected={sleepUnit}
            onSelect={setSleepUnit}
          />

          {/* Extra space at bottom */}
          <View className="h-10" />
          
        </ScrollView>
    </SafeAreaView>
  );
}