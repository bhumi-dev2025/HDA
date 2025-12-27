import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';

export default function HealthDetailsScreen() {
  // 1. Badha field mate State manage kariye
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  return (
    <ScrollView className="flex-1 bg-[#FAFAFA] p-6">
      
      {/* --- Header Section --- */}
      <Text className="text-xl font-bold text-black mb-2">
        Personalize Fitness and Health
      </Text>
      
      <Text className="text-left text-base text-gray-400 mb-6 leading-5">
        This information ensures Fitness and Health data are{'\n'}as accurate as possible. These details are not shared{'\n'}with others.
      </Text>

      {/* --- Form Container (White Box) --- */}
      {/* Ahiya ek j container banavyu che jethi badhu sathe group thai sake */}
      <View className="bg-white rounded-2xl overflow-hidden">
        
        {/* Field 1: Date of Birth */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <Text className="text-lg text-black font-medium">Date of Birth</Text>
          <TextInput 
            value={dob}
            onChangeText={setDob}
            placeholder="DD Mon YYYY"
            placeholderTextColor="#C7C7CC"
            className="text-right text-gray-500 text-base flex-1 ml-4"
          />
        </View>

        {/* Field 2: Sex */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <Text className="text-lg text-black font-medium">Sex</Text>
          <TextInput 
            value={sex}
            onChangeText={setSex}
            placeholder="Male/Female"
            placeholderTextColor="#C7C7CC"
            className="text-right text-gray-500 text-base flex-1 ml-4"
          />
        </View>

        {/* Field 3: Height */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <Text className="text-lg text-black font-medium">Height</Text>
          <TextInput 
            value={height}
            onChangeText={setHeight}
            placeholder="in cm"
            placeholderTextColor="#C7C7CC"
            // keyboardType="numeric" // Numbers only
            className="text-right text-gray-500 text-base flex-1 ml-4"
          />
        </View>

        {/* Field 4: Weight */}
        <View className="flex-row items-center justify-between p-4">
          <Text className="text-lg text-black font-medium">Weight</Text>
          <TextInput 
            value={weight}
            onChangeText={setWeight}
            placeholder="in kg"
            placeholderTextColor="#C7C7CC"
            // keyboardType="numeric" // Numbers only
            className="text-right text-gray-500 text-base flex-1 ml-4"
          />
        </View>

      </View>

    </ScrollView>
  );
}