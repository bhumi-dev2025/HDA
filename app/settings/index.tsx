import React,{useState,useEffect} from 'react';
import { View, Text, ScrollView, TouchableOpacity,ActivityIndicator,Alert,Image, ImageBackground} from 'react-native';
import { ChevronRight, Heart,User as UserIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import L1 from '../../assets/photo/home/L1.svg'
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ChevronLeft } from 'lucide-react-native';

const homeBg = require('../../assets/photo/login/2.0/home.png');

const Settingscreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('User');

    useEffect(() => {
        getProfile();
      }, []);
    
      async function getProfile() {
        try {
          setLoading(true);
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (session) {
            setSession(session);
            setAvatarUrl(session.user.user_metadata?.avatar_url || null);
            setUsername(session.user.user_metadata?.full_name || 'Human Design User');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    
      const handleLogout = async () => {
        try {
          await GoogleSignin.signOut();
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          router.replace('/'); 
        } catch (error: any) {
          await supabase.auth.signOut();
          router.replace('/');
        }
      };
    
      if (loading) {
        return (
          <View className="flex-1 justify-center items-center bg-black">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        );
      }
    
  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={homeBg}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
      <SafeAreaView className="flex-1">
        {/* --- Header --- */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: 8,
              borderRadius: 50,
            }}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-white absolute left-0 right-0 text-center -z-10">
            Settings
          </Text>
          
          <View className="w-8" />
        </View>

        <ScrollView className="flex-1 px-4 mt-8" showsVerticalScrollIndicator={false}>

          {/* --- Gemini AI --- */}
          <View className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <TouchableOpacity onPress={() => router.push('/settings/ai')} className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 18 }}>✨</Text>
                <Text className="text-base font-semibold text-white">Gemini AI</Text>
              </View>
              <ChevronRight size={20} color="#636366" />
            </TouchableOpacity>
          </View>

          {/* --- Notification --- */}
          <View className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <TouchableOpacity onPress={() => router.push('/setting_Screens/notifications')} className="flex-row items-center justify-between p-5">
              <Text className="text-base font-semibold text-white">Notification</Text>
              <ChevronRight size={20} color="#636366" />
            </TouchableOpacity>
          </View>

          {/* --- Health/Goals/Unit/Privacy Group --- */}
          <View className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <TouchableOpacity onPress={() => router.push('/setting_Screens/health')} className="flex-row items-center justify-between p-5">
              <Text className="text-base font-semibold text-white">Health Details</Text>
              <ChevronRight size={20} color="#636366" />
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 }} />
            <TouchableOpacity onPress={() => router.push('/setting_Screens/change')} className="flex-row items-center justify-between p-5">
              <Text className="text-base font-semibold text-white">Change Goals</Text>
              <ChevronRight size={20} color="#636366" />
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 }} />
            <TouchableOpacity onPress={() => router.push('/setting_Screens/unit')} className="flex-row items-center justify-between p-5">
              <Text className="text-base font-semibold text-white">Unit of Measure</Text>
              <ChevronRight size={20} color="#636366" />
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 }} />
            <TouchableOpacity className="flex-row items-center justify-between p-5">
              <Text className="text-base font-semibold text-white">Privacy</Text>
              <ChevronRight size={20} color="#636366" />
            </TouchableOpacity>
          </View>

          {/* --- Help/Account/SignOut Group --- */}
          <View className="rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <TouchableOpacity className="flex-row items-center justify-between p-5">
              <Text className="text-base font-semibold text-white">Help & Support</Text>
              <ChevronRight size={20} color="#636366" />
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 }} />
            <TouchableOpacity onPress={() => router.push('/setting_Screens/account')} className="flex-row items-center justify-between p-5">
              <Text className="text-base font-semibold text-white">Manage Account</Text>
              <ChevronRight size={20} color="#636366" />
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 }} />
            <TouchableOpacity onPress={handleLogout} className="p-5">
              <Text className="text-base font-semibold text-red-500">Sign out</Text>
            </TouchableOpacity>
          </View>

          {/* --- Footer Branding --- */}
          <View className="items-center pb-10">
            <Heart size={20} color="#FF4D4D" fill="#FF4D4D" />
            <Text className="text-xs font-bold text-white mt-2">Human Design Academy</Text>
            <Text className="text-[10px] text-[#636366] mt-1">Designed by Simple Studio</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
export default Settingscreen;
