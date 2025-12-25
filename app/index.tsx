import { View, Text,Image, TouchableOpacity ,Alert} from 'react-native'
import React ,{useEffect}from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' 
import  B1  from '../assets/photo/login/B1.svg'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

const explore = () => {
  const router = useRouter();
  const back = require('../assets/photo/login/back.png')
  const logo = require('../assets/photo/login/b2.png')

  useEffect(() => {
    // એપ ચાલુ થાય ત્યારે ગૂગલ લોગિન સેટઅપ થાય
    GoogleSignin.configure({
      // અહી તમારું WEB CLIENT ID નાખો (Android/iOS Client ID નહિ)
      webClientId: '790584136096-vkdeh0clpkq5p4gdpl164oduottehj9f.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      // 1. ગૂગલ પ્લે સર્વિસ છે કે નહિ તે ચેક કરે
      await GoogleSignin.hasPlayServices();
      
      // 2. ગૂગલ લોગિનનું પોપ-અપ ખુલે અને યુઝર સાઈન-ઈન કરે
      const userInfo = await GoogleSignin.signIn();
      
      // 3. જો ID Token મળે તો આગળ વધો
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          Alert.alert("Supabase Error", error.message);
        } else {
          // 4. લોગિન સફળ થાય એટલે Home સ્ક્રીન પર મોકલો
          console.log("Login Success:", data);
          router.replace("/(tabs)/home"); // અથવા જે તમારું હોમ પેજ હોય ત્યાં
        }
      } else {
        throw new Error('No ID token present!');
      }

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services not available or outdated");
      } else {
        console.log("Error:", error);
        Alert.alert("Error", error.message);
      }
    }
  };
  return (
   <SafeAreaView>
    <View className='h-[100%] w-[100%] justify-center items-center'>
      <Image source={back} className='absolute h-[100%] w-[100%]' resizeMode='cover'></Image>

      <View className='items-center mt-2'>
        <Image source={logo} className='w-[320px] h-[320px]' resizeMode='contain'/>
      </View>

      <View className="absolute w-full px-10 mb-[-150%]">
        <TouchableOpacity onPress={onGoogleButtonPress} activeOpacity={0.9} className='bg-black flex-row items-center justify-center py-4 rounded-2xl shadow-lg gap-2'>
          <B1></B1>
          <Text className="text-white font-bold text-lg mr-3">
                Sign in with Google
              </Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  )
}

export default explore