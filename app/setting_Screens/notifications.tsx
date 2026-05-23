import React, { useState } from 'react';
import { View, Text, Switch, ImageBackground } from 'react-native';

const homeBg = require('../../assets/photo/login/2.0/home.png');

export default function NotificationsScreen() {
  const [sendReminders, setSendReminders] = useState(true);
  const [goalCompletions, setGoalCompletions] = useState(true);
  const [newFeatures, setNewFeatures] = useState(true);

  return (
    <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
    <View className="flex-1 p-6 pt-32">

      <View className="flex-row items-center justify-between p-5 rounded-2xl mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        <Text className="text-base font-semibold text-white">Send Reminders</Text>
        <Switch
          trackColor={{ false: '#3A3A3C', true: '#636366' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#3A3A3C"
          onValueChange={() => setSendReminders(!sendReminders)}
          value={sendReminders}
        />
      </View>

      <View className="flex-row items-center justify-between p-5 rounded-2xl mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        <Text className="text-base font-semibold text-white">Goal Completions</Text>
        <Switch
          trackColor={{ false: '#3A3A3C', true: '#636366' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#3A3A3C"
          onValueChange={() => setGoalCompletions(!goalCompletions)}
          value={goalCompletions}
        />
      </View>

      <View className="flex-row items-center justify-between p-5 rounded-2xl mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        <Text className="text-base font-semibold text-white">New Features</Text>
        <Switch
          trackColor={{ false: '#3A3A3C', true: '#636366' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#3A3A3C"
          onValueChange={() => setNewFeatures(!newFeatures)}
          value={newFeatures}
        />
      </View>

    </View>
    </ImageBackground>
  );
}