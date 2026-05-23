import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, ImageBackground } from 'react-native';

const homeBg = require('../../assets/photo/login/2.0/home.png');

export default function HealthDetailsScreen() {
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  return (
    <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
    <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingTop: 80 }}>

      <Text className="text-xl font-bold text-white mb-2">
        Personalize Fitness and Health
      </Text>
      <Text className="text-left text-base text-[#636366] mb-6 leading-5">
        This information ensures Fitness and Health data are{'\n'}as accurate as possible. These details are not shared{'\n'}with others.
      </Text>

      <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>

        <View className="flex-row items-center justify-between p-4">
          <Text className="text-lg text-white font-medium">Date of Birth</Text>
          <TextInput
            value={dob} onChangeText={setDob}
            placeholder="DD Mon YYYY" placeholderTextColor="#636366"
            style={{ color: '#AFAFAF', textAlign: 'right', fontSize: 16, flex: 1, marginLeft: 16 }}
          />
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 8 }} />

        <View className="flex-row items-center justify-between p-4">
          <Text className="text-lg text-white font-medium">Sex</Text>
          <TextInput
            value={sex} onChangeText={setSex}
            placeholder="male/female" placeholderTextColor="#636366"
            style={{ color: '#AFAFAF', textAlign: 'right', fontSize: 16, flex: 1, marginLeft: 16 }}
          />
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 8 }} />

        <View className="flex-row items-center justify-between p-4">
          <Text className="text-lg text-white font-medium">Height</Text>
          <TextInput
            value={height} onChangeText={setHeight}
            placeholder="in cm" placeholderTextColor="#636366"
            style={{ color: '#AFAFAF', textAlign: 'right', fontSize: 16, flex: 1, marginLeft: 16 }}
          />
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 8 }} />

        <View className="flex-row items-center justify-between p-4">
          <Text className="text-lg text-white font-medium">Weight</Text>
          <TextInput
            value={weight} onChangeText={setWeight}
            placeholder="in kg" placeholderTextColor="#636366"
            style={{ color: '#AFAFAF', textAlign: 'right', fontSize: 16, flex: 1, marginLeft: 16 }}
          />
        </View>

      </View>
    </ScrollView>
    </ImageBackground>
  );
}