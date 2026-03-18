import { View, Text, Image, TouchableOpacity, Alert, StatusBar, Platform, ScrollView, KeyboardAvoidingView, TextInput, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import B1 from '../assets/photo/login/B1.svg'
import B2 from '../assets/photo/login/B2.svg'
//google login libary...
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';

//login code...
const Login = () => {
  const router = useRouter();
  const back = require('../assets/photo/login/back.png')
  const logo = require('../assets/photo/login/b2.png')

  //for demouser login state
  const [tapCount, setTapCount] = useState(0);
  const [showDemoLogin, setShowDemoLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      //google clude code ni -> web id 
      webClientId: '241217798940-f6ik71i9je097slar0i4rco98mc1re7m.apps.googleusercontent.com',
      iosClientId: '241217798940-ipmglh828epjv8q7v0ob4lrf2pvnuhs3.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: Platform.OS === "android" ? [
        'profile',
        'email',
        'https://www.googleapis.com/auth/fitness.activity.read',
      ] : ["profile",
        "email"]
    });
  }, []);

  //email password login code...
  const handleSecretTap = () => {
    if (showDemoLogin) return; // Jo already khuli gayu hoy to kai nai karvanu

    if (tapCount + 1 >= 5) {
      setShowDemoLogin(true);
      setTapCount(0);
      Alert.alert("Developer Mode", "Demo Login Enabled for Reviewers!");
    } else {
      setTapCount(tapCount + 1);
    }
  };

  // --- DEMO LOGIN FUNCTION ---
  const onDemoLoginPress = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter demo email and password");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Demo Login Failed", error.message);
    } else {
      console.log("Demo Login Success:", data.user.email);
      router.replace("/(tabs)/home");
    }
    setLoading(false);
  };

  // const onGoogleButtonPress = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();

  //     if (userInfo.data?.idToken) {
  //       const { data, error } = await supabase.auth.signInWithIdToken({
  //         provider: 'google',
  //         token: userInfo.data.idToken,
  //       });

  //       if (error) {
  //         Alert.alert("Supabase Error", error.message);
  //       } else {
  //         console.log("Login Success:", data.user.email);
  //         router.replace("/(tabs)/home");
  //       }
  //     } else {
  //       throw new Error('No ID token present!');
  //     }

  //   } catch (error: any) {
  //     // Error handling same as before...
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       console.log("User cancelled the login flow");
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       console.log("Sign in is in progress");
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       Alert.alert("Error", "Google Play Services not available or outdated");
  //     } else {
  //       console.log("Error:", error);
  //       Alert.alert("Error", error.message);
  //     }
  //   }
  // };
  const onGoogleButtonPress = async () => {
    try {
      if (Platform.OS === "android") {

        await GoogleSignin.hasPlayServices();
      }
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;

      // 🔥 Access token levu
      // const tokens = await GoogleSignin.getTokens();
      // const accessToken = tokens.accessToken;

      if (!idToken) {
        throw new Error("Login was cancelled. Please try signing in again.");
      }

      // Supabase login
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        Alert.alert("Supabase Error", error.message);
        return;
      }

      // console.log("Access Token:", accessToken);

      // Save access token in database
      // await supabase
      //   .from("profiles")
      //   .update({
      //     google_access_token: accessToken
      //   })
      //   .eq("id", data.user.id);

      router.replace("/(tabs)/home");

    } catch (error: any) {
      Alert.alert("Error", error.message);
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
      {/* KeyboardAvoidingView mukyu che jethi keyboard khule to input dankaay nai */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <SafeAreaView className="flex-1 justify-between">

            <View className="flex-1 justify-center items-center w-full px-4">
              <TouchableOpacity activeOpacity={1} onPress={handleSecretTap} className="w-full items-center justify-center">
                <Image
                  source={logo}
                  className="w-[80%] h-64"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* --- HIDDEN DEMO LOGIN SECTION --- */}
              {showDemoLogin && (
                <View className="w-full bg-white/90 p-4 rounded-xl border border-gray-200 shadow-sm mt-4 mb-4">
                  <Text className="text-center font-bold mb-2 text-gray-500">Reviewer Login</Text>
                  <TextInput
                    placeholder="Demo Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    className="text-black p-3 rounded-lg mb-2 border border-gray-300"
                    autoCapitalize="none"
                  />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="text-black p-3 rounded-lg mb-3 border border-gray-300"
                  />
                  <TouchableOpacity
                    onPress={onDemoLoginPress}
                    className="bg-black p-3 rounded-lg items-center"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold">Login as Demo User</Text>
                    )}
                  </TouchableOpacity>

                  {/* Hide Button */}
                  <TouchableOpacity onPress={() => setShowDemoLogin(false)} className="mt-2 items-center">
                    <Text className="text-red-500 text-xs">Hide</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* --------------------------------- */}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default Login  