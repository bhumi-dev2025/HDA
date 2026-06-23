import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HDA_LESSONS } from "../constants/hdaPathData";
import "../global.css";
import { supabase } from "../lib/supabase";

// ✅ Global fix: device/system font-size settings ignore કરો
// આનાથી badhi <Text> ane <TextInput> ni size badhi devices ma consistent rahese
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

if (typeof global !== "undefined") {
  const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  (global as any).ErrorUtils?.setGlobalHandler?.(
    (error: any, isFatal: boolean) => {
      if (error?.message?.includes("com.apple.healthkit")) return;
      originalHandler?.(error, isFatal);
    },
  );
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
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

    // Splash time e HDA data preload — tab click karto instant ready
    void HDA_LESSONS.length;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Banne ready hoy tyare j navigate karo — animation + session
  useEffect(() => {
    if (!initialized || !animationDone) return;

    const protectedGroups = ["(tabs)", "settings", "setting_Screens", "wallet"];
    const inProtectedRoute = protectedGroups.some((g) => segments[0] === g);

    if (!session && inProtectedRoute) {
      router.replace("/");
    } else if (session && (segments as string[]).length === 0) {
      router.replace("/(tabs)/home");
    }
  }, [session, initialized, animationDone, segments]);

  if (!initialized || !animationDone) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <LottieView
          source={require("../assets/lottie/splashanimation.json")}
          autoPlay
          loop={false}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          onAnimationFinish={() => setAnimationDone(true)}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings/index"
            options={{
              title: "Settings",
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: "600",
                color: "#111",
              },
              headerStyle: { backgroundColor: "#f5f5f5" },
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
          <Stack.Screen name="settings/ai" options={{ headerShown: false }} />
          <Stack.Screen name="phases" options={{ headerShown: false }} />
          <Stack.Screen name="phase-paywall" options={{ headerShown: false }} />
          <Stack.Screen name="phase-detail" options={{ headerShown: false }} />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
