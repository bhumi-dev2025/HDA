import React, { useState } from 'react';
import { View, Text, Switch} from 'react-native';
export default function NotificationsScreen() {
  // Toggle States
  const [sendReminders, setSendReminders] = useState(true);
  const [goalCompletions, setGoalCompletions] = useState(true);
  const [newFeatures, setNewFeatures] = useState(true);

  return (
    <View className="flex-1 bg-[#FAFAFA] p-6">
      
      {/* --- Toggle Item 1: Send Reminders --- */}
      <View className="flex-row items-center justify-between bg-[#F1F1F1] p-6 rounded-3xl mb-4">
        <Text className="text-base font-semibold text-black">Send Reminders</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#000000' }} // Active હોય ત્યારે Black
          thumbColor={sendReminders ? '#f4f3f4' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setSendReminders(!sendReminders)}
          value={sendReminders}
        />
      </View>

      {/* --- Toggle Item 2: Goal Completions --- */}
      <View className="flex-row items-center justify-between bg-[#F1F1F1] p-6 rounded-3xl mb-4">
        <Text className="text-base font-semibold text-black">Goal Completions</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#000000' }}
          thumbColor={goalCompletions ? '#f4f3f4' : '#f4f3f4'}
          onValueChange={() => setGoalCompletions(!goalCompletions)}
          value={goalCompletions}
        />
      </View>

      {/* --- Toggle Item 3: New Features --- */}
      <View className="flex-row items-center justify-between bg-[#F1F1F1] p-6 rounded-3xl mb-4">
        <Text className="text-base font-semibold text-black">New Features</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#000000' }}
          thumbColor={newFeatures ? '#f4f3f4' : '#f4f3f4'}
          onValueChange={() => setNewFeatures(!newFeatures)}
          value={newFeatures}
        />
      </View>

    </View>
  );
}