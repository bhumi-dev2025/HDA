import { View, Text, Image, TouchableOpacity, Alert, StatusBar, Platform } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import B1 from '../assets/photo/login/B1.svg'
import B2 from '../assets/photo/login/B2.svg'
//google login libary...
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';

//login code...
const Login = () => { // Component name Capital રાખવું સારું (login -> Login)
  const router = useRouter();
  const back = require('../assets/photo/login/back.png')
  const logo = require('../assets/photo/login/b2.png')

  useEffect(() => {
    GoogleSignin.configure({
      //google clude code ni -> web id 
      webClientId: '241217798940-f6ik71i9je097slar0i4rco98mc1re7m.apps.googleusercontent.com',
      iosClientId: '241217798940-ipmglh828epjv8q7v0ob4lrf2pvnuhs3.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          Alert.alert("Supabase Error", error.message);
        } else {
          console.log("Login Success:", data.user.email);
          router.replace("/(tabs)/home");
        }
      } else {
        throw new Error('No ID token present!');
      }

    } catch (error: any) {
      // Error handling same as before...
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

  const onAppleButtonPress = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error, data } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) {
          Alert.alert("Supabase Error", error.message);
        } else {
          console.log("Apple Login Success");
          router.replace("/(tabs)/home");
        }
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled flow
      } else {
        Alert.alert("Error", e.message);
      }
    }
  }
//login view....
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/**background image */}
      <Image 
        source={back} 
        className="absolute w-full h-full" 
        resizeMode="cover" 
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center w-full px-4">
            <Image 
              source={logo} 
              className="w-[80%] h-[50%]" 
              resizeMode="contain" 
            />
        </View>

        <View className="w-full px-8 mb-12">
          <TouchableOpacity 
            onPress={onGoogleButtonPress} 
            activeOpacity={0.9} 
            className="bg-black flex-row items-center justify-center py-4 rounded-2xl shadow-lg gap-3 mb-4"
          >
            <B1 />
            <Text className="text-white font-bold text-lg">
              Sign in with Google
            </Text>
          </TouchableOpacity>
          {Platform.OS === 'ios' && (
            <TouchableOpacity 
            onPress={onAppleButtonPress} 
            activeOpacity={0.9} 
            className="bg-white flex-row items-center justify-center py-4 rounded-2xl border shadow-lg gap-3"
          >
            <B2 />
            <Text className="text-black font-bold text-lg">
              Sign in with Apple
            </Text>
          </TouchableOpacity>
          )}
          
        </View>

      </SafeAreaView>
    </View>
  )
}

export default Login