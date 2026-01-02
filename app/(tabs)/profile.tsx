import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Plus, Heart } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
// import { SafeAreaView } from 'react-native-safe-area-context';
import I5 from '../../assets/photo/home/I5.svg'
import P1 from '../../assets/photo/profile/P1.svg'
import P2 from '../../assets/photo/profile/P2.svg'
import P4 from '../../assets/photo/profile/P4.svg'

import { AddExpertiseModal } from '@/componunts/Modals/AddSkils';
import { AddPortfolioModal } from '@/componunts/Modals/AddPortfolio';
import { MASTER_SKILLS } from '../../constants/skillData'; // <--- ડેટા ફાઈલ ઈમ્પોર્ટ કરી
import { getUserSkills, saveUserSkills } from '../../lib/SkillService';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const p1 = require('../../assets/photo/profile/p1.png');

  // 2. User Data State
  const [username, setUsername] = useState('Loading...');
  const [avatarUrl, setAvatarUrl] = useState(null);

  // --- New State for Skills ---
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]); // <--- સિલેક્ટ કરેલી સ્કિલ્સ અહીં સ્ટોર થશે
  // 1. User Profile & SKILLS બંને લોડ કરો
  useEffect(() => {
    const loadData = async () => {
      // User Profile Logic
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsername(user.user_metadata?.full_name || 'User');
        setAvatarUrl(user.user_metadata?.avatar_url);
        
        // --- NEW: Skills Load Logic ---
        const savedIds = await getUserSkills();
        setSelectedSkillIds(savedIds); // ડેટાબેઝમાંથી આવેલા IDs સેટ કરો
      }
    };
    loadData();
  }, []);

  // 3. Fetch User Data from Supabase
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
          const googlePhoto = user.user_metadata?.avatar_url;
          setUsername(googleName);
          setAvatarUrl(googlePhoto);
        }
      } catch (error) {
        console.log('Error fetching user:', error);
      }
    };
    getUserProfile();
  }, []);

  const defaultImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop';

  // State Management for Modals
  const [showExpertise, setShowExpertise] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);

  // --- Function to Handle Save from Modal ---
  const handleSaveSkills = async (ids:string[]) => {
    setSelectedSkillIds(ids);

    console.log("Saving to Supabase:", ids);
    await saveUserSkills(ids);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Main ScrollView */}
      {/* <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      > */}

        {/* Top Header Background */}
        <View className="relative w-full h-64">
          <Image source={p1} className="w-full h-full object-cover" />
          <View className="absolute top-12 right-5 bg-white h-8 w-14 p-1 rounded-full flex-row items-center justify-between">
            <I5 height={20} width={20}></I5>
            <Text className="font-bold text-sm text-center">1.2</Text>
          </View>
        </View>

        {/* Profile Content Container */}
        <View className="bg-white rounded-t-[40px] -mt-16 p-5 pt-16 relative flex-1">

          {/* Profile Picture */}
          <View className="absolute -top-14 left-0 right-0 items-center">
            <View className="p-1 rounded-full border-2 border-dashed border-red-300">
              <View className="p-1 bg-white rounded-full">
                <Image
                  source={{ uri: avatarUrl || defaultImage }}
                  className="w-24 h-24 rounded-full"
                />
              </View>
            </View>
            <TouchableOpacity className="absolute bottom-[-10px] bg-red-400 p-1 rounded-full border-4 border-white">
              <Plus height={10} width={25} color="white" strokeWidth={4} />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="items-center mt-6 space-y-2">
            <View className="flex-row items-center space-x-2 mb-5">
              <Text className="text-2xl font-bold">{username}</Text>
              <View className="rounded-full p-1">
                <P1 height={20} width={20}></P1>
              </View>
            </View>

            <Text className="text-lg font-semibold text-center">
              Will work for humans not for machin
            </Text>

            <TouchableOpacity className="flex-row items-center space-x-1 mt-1 gap-2">
              <P2></P2>
              <Text className="text-blue-500 font-medium text-base underline">Portfolio link</Text>
            </TouchableOpacity>
          </View>
        <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        >
          {/* ================= SECTIONS: EXPERTISE ================= */}
          <View className="mt-10 space-y-4 p-4">
            <View className="flex-row items-center space-x-2 gap-2 mb-2">
              <P4></P4>
              <Text className="text-lg font-bold text-gray-400">My Expertise</Text>
            </View>

            {/* Container for Skills + Add Button */}
            {/* flex-wrap: જેથી skills બાજુમાં ગોઠવાય અને જગ્યા ન હોય તો નીચે જાય */}
            <View className="flex-row flex-wrap gap-3 items-center">
              
              {/* 1. Map through Selected Skills */}
              {selectedSkillIds.map((id) => {
                const skill = MASTER_SKILLS.find(s => s.id === id);
                if (!skill) return null;
                
                const IconComponent = skill.icon;
                return (
                  <View key={id} className="flex-row items-center bg-[#f1f1f1] h-[44px] px-3 rounded-[8px] border-4 border-white" style={styles.customShadow}>
                     {skill.type === 'svg' ? (
                       // @ts-ignore
                      <IconComponent height={18} width={18} />
                    ) : (
                      <IconComponent size={16} color="#6b7280" />
                    )}
                    <Text className="ml-2 text-gray-700 font-medium">{skill.name}</Text>
                  </View>
                );
              })}

              {/* 2. Add Skill Button (Always at the end) */}
              <TouchableOpacity
                onPress={() => setShowExpertise(true)}
                className="flex-row items-center bg-[#f1f1f1] h-[44px] px-3 rounded-[8px] border-4 border-white"
                style={styles.customShadow}
              >
                <View className="border border-gray-400 rounded-full p-0.5 mr-2">
                  <Plus size={10} color="#6b7280" />
                </View>
                <Text className="text-gray-600 font-medium">Add Skill</Text>
              </TouchableOpacity>
              
            </View>
          </View>

          {/* ================= SECTIONS: PORTFOLIO ================= */}
          <View className="mt-10 space-y-4 p-4">
            <View className="flex-row items-center space-x-2 gap-2 mb-5">
              <P4></P4>
              <Text className="text-lg font-bold text-gray-400">Portfolio</Text>
            </View>

            {/* Container for Portfolio + Add Button */}
            <View className="flex-row flex-wrap gap-3 items-center">
              
              {/* Future: Map through Portfolio Items Here */}
              {/* {myPortfolios.map(...)} */}

              {/* Add Portfolio Button (Always at the end) */}
              <TouchableOpacity
                onPress={() => setShowPortfolio(true)}
                className="flex-row items-center bg-[#f1f1f1] h-[44px] px-3 rounded-[8px] border-4 border-white"
                style={styles.customShadow}
              >
                <View className="border border-gray-400 rounded-full p-0.5 mr-2">
                  <Plus size={10} color="#6b7280" />
                </View>
                <Text className="text-gray-600 font-medium">Add Portfolio</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Footer Branding */}
          <View className="mt-auto pt-20 pb-10 items-center justify-center space-y-1">
            <Heart size={20} color="#ef4444" fill="#ef4444" />
            <Text className="text-gray-400 text-xs font-semibold mt-2">Human Design Academy</Text>
            <Text className="text-gray-300 text-[10px]">Designed by Simple Studio</Text>
          </View>
          </ScrollView>

        </View>
      {/* </ScrollView> */}

      {/* ----------------- MODALS ----------------- */}
      <AddExpertiseModal
        isVisible={showExpertise}
        onClose={() => setShowExpertise(false)}
        onSave={handleSaveSkills}          // <--- Function connected
        initialSelectedSkills={selectedSkillIds} // <--- Pass current state
      />

      <AddPortfolioModal
        isVisible={showPortfolio}
        onClose={() => setShowPortfolio(false)}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  customShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});