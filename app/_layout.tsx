import { Ionicons } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import "../global.css";
import { supabase } from "../lib/supabase";


export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
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

    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!session && inAuthGroup) {
      router.replace('/'); 
    } else if (session && (segments as string[]).length === 0) {
      router.replace('/(tabs)/home');
    }
  }, [session, initialized, segments]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="settings/index"
        options={{
          // headerShown: true,
          title: "Settings",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 16, fontWeight: "600", color: "#111" },
          headerStyle: { backgroundColor: "#f5f5f5" },
          // headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#e5e5e5", alignItems: "center", justifyContent: "center", marginLeft: 4 }}
            >
              <Ionicons name="chevron-back" size={18} color="#111" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="settings/ai"
        options={{
          headerShown: true,
          title: "AI Settings",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: "600",
            color: "#111",
          },
          headerStyle: {
            backgroundColor: "#f5f5f5",
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: "#e5e5e5",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 4,
              }}
            >
              <Ionicons name="chevron-back" size={18} color="#111" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  ); 
}
