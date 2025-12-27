import React,{useState,useEffect} from 'react';
import { View, Text, ScrollView, TouchableOpacity,ActivityIndicator,Alert,Image} from 'react-native';
import { ChevronRight, Heart,User as UserIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import L1 from '../../assets/photo/home/L1.svg'
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase'; // ખાતરી કરજો કે આ પાથ સાચો છે
import { Session } from '@supabase/supabase-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';



const Profile = () => {
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
          // વર્તમાન સેશન મેળવો
          const { data: { session }, error } = await supabase.auth.getSession();
    
          if (error) throw error;
    
          if (session) {
            setSession(session);
            // Google લૉગિન મેટાડેટામાંથી ડેટા સેટ કરો
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
          // 1. પહેલા Google માંથી સાઇન આઉટ કરો (આનાથી એકાઉન્ટ સિલેક્શન ફરી આવશે)
          await GoogleSignin.signOut();
    
          // 2. પછી Supabase માંથી સાઇન આઉટ કરો
          const { error } = await supabase.auth.signOut();
          console.log("user log out..");
          if (error) throw error;
          
          // 3. લોગિન સ્ક્રીન પર રીડાયરેક્ટ કરો
          router.replace('/'); 
        } catch (error: any) {
          console.log("Logout Error:", error);
          // જો ગૂગલ સાઇન આઉટમાં કોઈ એરર આવે તો પણ Supabase logout તો થવું જ જોઈએ
          await supabase.auth.signOut();
          router.replace('/');
        }
      };
    
      if (loading) {
        return (
          <View className="flex-1 justify-center items-center bg-[#F1F1F1]">
            <ActivityIndicator size="large" color="#333" />
          </View>
        );
      }
    
  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F2] p-4">
      {/* --- Header --- */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        {/* Logo Placeholder (Black H) */}
        <L1></L1>
        
        <Text className="text-xl font-bold text-black absolute left-0 right-0 text-center -z-10">
          Account
        </Text>
        
        {/* Right side spacer to keep title centered */}
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4 mt-8" showsVerticalScrollIndicator={false}>
        
        {/* --- Profile Card --- */}
        <View className="bg-white rounded-md p-5 mb-8 flex-row items-center shadow-sm">
          <View className="h-12 w-12 bg-[#E5E0D8] rounded-2xl items-center justify-center mr-4">
            {avatarUrl ? (
              <Image 
                source={{ uri: avatarUrl }} 
                className="w-12 h-12 rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded-2xl bg-[#E5E0D8] items-center justify-center">
                <UserIcon size={24} color="#999" />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-black">{username}</Text>
            <Text className="text-sm text-gray-400">{session?.user.email}</Text>
          </View>
          <ChevronRight size={20} color="#D1D1D1" />
        </View>

        {/* --- Menu Items Group --- */}
        <View className="bg-white rounded-md overflow-hidden mb-6 shadow-sm">
          <TouchableOpacity onPress={()=>router.push('/profile_Screens/notifications')} className='flex-row items-center justify-between p-5'>
            <Text className="text-base font-semibold text-black">Notifications</Text>
            <ChevronRight size={20} color="#D1D1D1" />
          </TouchableOpacity>
        </View>

        {/* --- Help & Support --- */}
        <View className="bg-white rounded-md overflow-hidden mb-1 shadow-sm">
          <TouchableOpacity onPress={()=>router.push('/profile_Screens/health')} className='flex-row items-center justify-between p-5'>
            <Text className="text-base font-semibold text-black">Health Details</Text>
            <ChevronRight size={20} color="#D1D1D1" />
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-md overflow-hidden mb-1 shadow-sm">
          <TouchableOpacity onPress={()=>router.push('/profile_Screens/change')} className='flex-row items-center justify-between p-5'>
            <Text className="text-base font-semibold text-black">Change Goals</Text>
            <ChevronRight size={20} color="#D1D1D1" />
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-md overflow-hidden mb-1 shadow-sm">
          <TouchableOpacity onPress={()=>router.push('/profile_Screens/unit')} className='flex-row items-center justify-between p-5'>
            <Text className="text-base font-semibold text-black">Unit of Measure</Text>
            <ChevronRight size={20} color="#D1D1D1" />
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-md overflow-hidden mb-6 shadow-sm">
          <TouchableOpacity className='flex-row items-center justify-between p-5'>
            <Text className="text-base font-semibold text-black">Privacy</Text>
            <ChevronRight size={20} color="#D1D1D1" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-md overflow-hidden mb-1 shadow-sm">
          <TouchableOpacity className='flex-row items-center justify-between p-5'>
            <Text className="text-base font-semibold text-black">Heelp & Support</Text>
            <ChevronRight size={20} color="#D1D1D1" />
          </TouchableOpacity>
        </View>
        {/* --- Sign Out --- */}
        <TouchableOpacity className="bg-white rounded-md p-5 mb-20 shadow-sm" onPress={handleLogout}>
          <Text className="text-base font-medium text-red-600">Sign Out</Text>
        </TouchableOpacity>

        {/* --- Footer Branding --- */}
        <View className="items-center">
          <Heart size={20} color="#FF4D4D" fill="#FF4D4D" className="mb-2" />
          <Text className="text-xs font-semibold text-gray-400">Human Design Academy</Text>
          <Text className="text-[10px] text-gray-300 mt-1">Designed by Simple Studio</Text>
        </View>

      </ScrollView>


    </SafeAreaView>
  );
}
export default Profile;