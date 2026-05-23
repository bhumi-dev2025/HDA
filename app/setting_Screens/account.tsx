import React, { useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { Heart, ChevronLeft } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import DeleteAccountModal from '../../componunts/Modals/DeleteModal';
import { supabase } from '../../lib/supabase';

const homeBg = require('../../assets/photo/login/2.0/home.png');

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
        <View style={{ flex: 1, backgroundColor: '#000' }}>
        <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: 8, borderRadius: 50 }}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', position: 'absolute', left: 0, right: 0, textAlign: 'center', zIndex: -1 }}>
              Manage Account
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 24 }} showsVerticalScrollIndicator={false}>
            
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 }}>
              Why are you leaving?
            </Text>
            <Text style={{ color: '#636366', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              Helping us improve by telling us why you want to delete your account.
            </Text>

            {/* Options */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 }}>
              {['To Expensive', 'Privacy concerns', 'No longer need it', 'Found alternative', 'Other'].map((item, index, arr) => (
                <View key={item}>
                  <TouchableOpacity style={{ padding: 18 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '500' }}>{item}</Text>
                  </TouchableOpacity>
                  {index < arr.length - 1 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 }} />}
                </View>
              ))}
            </View>

            {/* Delete Account */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,0,0,0.15)', marginBottom: 40 }}>
              <TouchableOpacity style={{ padding: 18 }} onPress={handleOpenModal}>
                <Text style={{ color: '#FF453A', fontSize: 15, fontWeight: '600' }}>Delete Account</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center', paddingBottom: 40 }}>
              <Heart size={20} color="#FF4D4D" fill="#FF4D4D" />
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginTop: 8 }}>Human Design Academy</Text>
              <Text style={{ color: '#636366', fontSize: 10, marginTop: 4 }}>Designed by Simple Studio</Text>
            </View>

          </ScrollView>

          <DeleteAccountModal ref={deleteModalRef} onConfirm={handleDeleteAction} />

        </SafeAreaView>
        </ImageBackground>
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}