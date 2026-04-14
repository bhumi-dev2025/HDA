import { Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { supabase } from "../lib/supabase";


export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 1. App start thay tyare check karo ke user already login chhe?
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          // Invalid/expired token — clear session, login par moklo
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(session);
        }
      } catch (e) {
        await supabase.auth.signOut();
        setSession(null);
      } finally {
        setInitialized(true);
      }
    };

    checkUser();

    // 2. Login ke Logout thay tyare aa function automatic run thase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // Check karo ke user kyare (tabs) folder ma chhe ke nahi
    const inAuthGroup = segments[0] === '(tabs)';
    
    // Logic:
    // Case 1: User Login NATHI pan Home page (tabs) access kare chhe -> Login par moklo
    if (!session && inAuthGroup) {
      // Tamari login file nu nam 'index' hoy to '/' lakho, athva '/login'
      router.replace('/'); 
    } 
    // Case 2: User Login CHHE ane Login page par ubho chhe -> Home par moklo
    else if (session && (segments as string[]).length === 0) {
      router.replace('/(tabs)/home');
    }
  }, [session, initialized, segments]);

  // Jya sudhi check thay tya sudhi Loading Circle farse
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Ahiya tamari badhi screens Stack ma automatic avi jase */}
      <Stack.Screen name="index" /> 
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings/ai" options={{ headerShown: true, title: "AI Settings" }} />
      {/* <Stack.Screen name="collectionDetail" /> */}
    </Stack>
  ); 
}