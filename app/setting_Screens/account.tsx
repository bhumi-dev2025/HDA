import React, { useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity,Alert } from 'react-native';
import { Heart, ChevronLeft } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import DeleteAccountModal from '../../componunts/Modals/DeleteModal';

import { supabase } from '../../lib/supabase';

export default function ManageAccountScreen() {
  const router = useRouter();
  
  // 1. Ref બનાવ્યો
  const deleteModalRef = useRef<BottomSheetModal>(null);

  // 2. Modal Open કરવાનું ફંક્શન
  const handleOpenModal = useCallback(() => {
    deleteModalRef.current?.present();
  }, []);

  // 3. Delete Action
    const handleDeleteAction = async () => {
    try {
      // 1. Supabase માંથી ડેટા ડિલીટ કરો
      const { error } = await supabase.rpc('delete_user_account');
      if (error) console.log("Deletion Error:", error.message);

    } catch (error: any) {
      console.log("Unexpected Error:", error.message);
    } finally {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.log("Google SignOut Error (Maybe user wasn't logged in via Google):", e);
      }

      // 2. Supabase માંથી લોગ આઉટ
      await supabase.auth.signOut();

      // 3. Login Page પર રિડાયરેક્ટ
      Alert.alert(
        "Account Deleted",
        "Your account has been permanently deleted.",
        [
          { text: "OK", onPress: () => router.replace('/') }
        ]
      );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        
        <SafeAreaView className="flex-1 bg-[#FAFAFA]">
          
          {/* Header Section */}
          <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{
                backgroundColor: '#F1F1F1',
                padding: 8,
                borderRadius: 50,
                marginLeft: 0,
              }}
            >
              <ChevronLeft size={24} color="black" />
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-black absolute left-0 right-0 text-center -z-10">
              Manage Account
            </Text>
            
            <View className="w-8" />
          </View> 

          <ScrollView className="flex-1 px-6 mt-8" showsVerticalScrollIndicator={false}>
            
            <Text className="text-xl font-bold text-black mb-2">
              Why are you leaving?
            </Text>
            
            <Text className="text-left text-base text-gray-400 mb-6 leading-5">
              Helping us improve by telling us why you want to delete your account.
            </Text>

            <View className="p-2">
               {/* Options List */}
               <View className='bg-white rounded-md p-5 mb-1'>
                 <Text className='text-base font-medium'>To Expensive</Text>
               </View> 
               <View className='bg-white rounded-md p-5 mb-1'>
                 <Text className='text-base font-medium'>Privacy concerns</Text>
               </View> 
               <View className='bg-white rounded-md p-5 mb-1'>
                 <Text className='text-base font-medium'>No longer need it</Text>
               </View> 
               <View className='bg-white rounded-md p-5 mb-1'>
                 <Text className='text-base font-medium'>Found alternative</Text>
               </View> 
               <View className='bg-white rounded-md p-5 mb-6'>
                 <Text className='text-base font-medium'>Other</Text>
               </View> 
               
               {/* 5. Delete Button પર onPress લગાવ્યું */}
               <TouchableOpacity 
                 className="bg-white rounded-md p-5 mb-60"
                 onPress={handleOpenModal} // 🔥 અહી ક્લિક કરવાથી મોડલ ખુલશે
               >
                  <Text className="text-base font-medium text-red-600">Delete Account</Text>
               </TouchableOpacity>
            </View>

            <View className='p-2 justify-center items-center'>
              <Heart size={20} color="#FF4D4D" fill="#FF4D4D" className="mb-2" />
                <Text className="text-sm font-semibold text-gray-400">Human Design Academy</Text>
                <Text className="text-[10px] text-gray-300 mt-1">Designed by Simple Studio</Text>
            </View>

          </ScrollView>

          {/* 6. છેલ્લે તમારું બનાવેલું મોડલ અહી મૂક્યું */}
          <DeleteAccountModal 
            ref={deleteModalRef} 
            onConfirm={handleDeleteAction} 
          />

        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}