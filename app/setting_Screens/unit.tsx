import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const homeBg = require('../../assets/photo/login/2.0/home.png');

type UnitOption = string;
interface UnitSectionProps {
  title: string;
  options: UnitOption[];
  selected: UnitOption;
  onSelect: (option: UnitOption) => void;
}

const UnitSection: React.FC<UnitSectionProps> = ({ title, options, selected, onSelect }) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10, marginLeft: 4 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        {options.map((option, index) => {
          const isSelected = selected === option;
          const isLast = index === options.length - 1;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                padding: 16,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <Text style={{ fontSize: 15, color: isSelected ? '#FFFFFF' : '#AFAFAF', fontWeight: isSelected ? '600' : '400' }}>
                {option}
              </Text>
              {isSelected && <Check size={20} color="#FFFFFF" strokeWidth={2.5} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function UnitOfMeasureScreen() {
  const [meditationUnit, setMeditationUnit] = useState<string>('Minutes');
  const [stepsUnit, setStepsUnit] = useState<string>('Steps');
  const [waterUnit, setWaterUnit] = useState<string>('Liter');
  const [sleepUnit, setSleepUnit] = useState<string>('Hours');

  return (
    <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 64 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <UnitSection title="Meditation Units" options={['Minutes', 'Hours']} selected={meditationUnit} onSelect={setMeditationUnit} />
        <UnitSection title="Steps Units" options={['Steps', 'Kilometers']} selected={stepsUnit} onSelect={setStepsUnit} />
        <UnitSection title="Water Units" options={['Liter', 'Bottle or Glass']} selected={waterUnit} onSelect={setWaterUnit} />
        <UnitSection title="Sleep Time Units" options={['Minutes', 'Hours']} selected={sleepUnit} onSelect={setSleepUnit} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}