import { GoogleSignin } from "@react-native-google-signin/google-signin";

import * as AppleAuthentication from "expo-apple-authentication";

import { useRouter } from "expo-router";

import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Svg, { Path } from "react-native-svg";

import B1 from "../assets/photo/login/B1.svg";

import B2 from "../assets/photo/login/B2.svg";

import { supabase } from "../lib/supabase";

// ── Moving dash — auto rotates based on path direction ────────────

const MovingDash = ({
  points,

  duration = 3000,
}: {
  points: { x: number; y: number }[];

  duration?: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),

        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const n = points.length - 1;

  const inputRange = points.map((_, i) => i / n);

  const translateX = anim.interpolate({
    inputRange,
    outputRange: points.map((p) => p.x),
  });

  const translateY = anim.interpolate({
    inputRange,
    outputRange: points.map((p) => p.y),
  });

  // Calculate angle between each consecutive point

  const angles = points.slice(0, -1).map((p, i) => {
    const dx = points[i + 1].x - p.x;

    const dy = points[i + 1].y - p.y;

    return (Math.atan2(dy, dx) * 180) / Math.PI;
  });

  // Add last angle same as previous

  angles.push(angles[angles.length - 1]);

  const rotate = anim.interpolate({
    inputRange,

    outputRange: angles.map((a) => `${a}deg`),
  });

  return (
    <>
      {/* Glow layer 1 — large blur */}
      <Animated.View
        style={{
          position: "absolute",
          width: 20,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#8765E4",
          opacity: 0.3,
          transform: [{ translateX }, { translateY }, { rotate }],
          marginLeft: -10,
          marginTop: -5,
        }}
      />
      {/* Glow layer 2 — medium blur */}
      <Animated.View
        style={{
          position: "absolute",
          width: 16,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#8765E4",
          opacity: 0.5,
          transform: [{ translateX }, { translateY }, { rotate }],
          marginLeft: -8,
          marginTop: -3,
        }}
      />
      {/* White dash on top */}
      <Animated.View
        style={{
          position: "absolute",
          width: 14,
          height: 4,
          borderRadius: 2,
          backgroundColor: "white",
          transform: [{ translateX }, { translateY }, { rotate }],
          marginLeft: -7,
          marginTop: -2,
        }}
      />
    </>
  );
};

// ── Static SVG Path ────────────────────────────────────────────────

const OnboardingPath = () => (
  <Svg width="343" height="549" viewBox="0 0 343 549" fill="none">
    <Path
      d="M51.2217 124.001C55.64 124.001 59.2217 120.419 59.2217 116.001C59.2216 111.582 55.6399 108.001 51.2217 108.001C46.8036 108.001 43.2218 111.583 43.2217 116.001C43.2217 120.419 46.8035 124.001 51.2217 124.001Z"
      fill="white"
    />

    <Path
      d="M52.0693 129.197V129.836M52.0693 137.115V140.393M52.0693 147.673V150.951M52.0693 158.229V161.508M52.0693 168.787V171.34M52.0693 177.165V178.991M51.2383 188.341C51.7862 188.27 52.1698 187.768 52.127 187.218C52.0889 186.727 52.0693 186.23 52.0693 185.729V184.816M55.2012 197.905C55.6391 197.568 55.719 196.942 55.4058 196.487M63.4131 204.212C63.625 203.701 63.3817 203.119 62.8834 202.88M73.7168 205.729H71.0693M84.3066 205.729H80.0117M94.8975 205.729H90.6016M105.487 205.729H101.192M116.077 205.729H111.782M126.667 205.729H122.372M137.258 205.729H132.963M147.812 205.898C147.884 205.351 147.498 204.847 146.948 204.801M157.376 209.861C157.713 209.423 157.632 208.793 157.178 208.478M163.682 218.074C164.193 217.863 164.437 217.276 164.201 216.777M166.2 225.729V226.068M166.2 230.416H164.87"
      stroke="black"
      strokeOpacity={0.7}
      strokeWidth={4}
    />

    <Path
      d="M165.5 240C167.433 240 169 238.433 169 236.5C169 234.567 167.433 233 165.5 233C163.567 233 162 234.567 162 236.5C162 238.433 163.567 240 165.5 240Z"
      fill="black"
    />

    <Path
      d="M277.953 183.453C281.543 183.453 284.453 180.543 284.453 176.953C284.453 173.363 281.543 170.453 277.953 170.453C274.363 170.453 271.453 173.363 271.453 176.953C271.453 180.543 274.363 183.453 277.953 183.453Z"
      fill="white"
    />

    <Path
      d="M278.5 185.5V185.757M278.5 192.271V194.786M278.5 201.301V203.814M278.5 210.329V212.919M278.5 219.583V222.248M278.5 228.912V231.577M278.5 238.241V240.905M278.5 247.57V250.234M278.5 256.899V259.563M278.5 266.228V268.892M277.331 279.502C277.879 279.573 278.383 279.187 278.428 278.637C278.476 278.061 278.5 277.478 278.5 276.89V275.557M273.367 289.065C273.805 289.402 274.435 289.321 274.751 288.868M265.155 295.372C265.367 295.882 265.953 296.126 266.453 295.891M226.138 296.89H225.138M257.5 297.89H255.648M237.542 296.89H232.84M248.946 296.89H244.244"
      stroke="black"
      strokeOpacity={0.7}
      strokeWidth={4}
    />

    <Path
      d="M220.5 300.489C221.775 300.489 222.89 299.808 223.502 298.789C223.8 298.294 224.285 297.89 224.863 297.89H225.138M225.138 295.89H224.794C224.215 295.89 223.721 295.501 223.395 295.022C222.765 294.097 221.703 293.489 220.5 293.489C218.567 293.489 217 295.056 217 296.989C217 298.922 218.567 300.489 220.5 300.489Z"
      fill="black"
    />

    <Path
      d="M49.5 423.036C53.0898 423.036 56 420.126 56 416.536C56 412.946 53.0898 410.036 49.5 410.036C45.9102 410.036 43 412.946 43 416.536C43 420.126 45.9102 423.036 49.5 423.036Z"
      fill="white"
    />

    <Path
      d="M47.9531 406V404.988M47.9531 396.964V392.939M47.9531 384.915V381.57M47.9531 374.906V372.241M47.9531 365.577V362.912M47.9531 356.248V353.584M47.9531 346.919V344.255M47.9531 337.59V334.926M47.9531 328.261V325.597M49.1221 314.987C48.5746 314.916 48.0705 315.302 48.0251 315.852M53.0859 305.424C52.648 305.087 52.018 305.168 51.7026 305.622M61.298 299.117C61.0865 298.607 60.5001 298.363 60.0006 298.598M101.59 296.6H101.315M68.9531 296.6H70.8047M88.9111 297.6H89.9111M77.5068 297.6H78.5068"
      stroke="black"
      strokeOpacity={0.7}
      strokeWidth={4}
    />

    <Path
      d="M105.953 301C107.886 301 109.453 299.433 109.453 297.5C109.453 295.567 107.886 294 105.953 294C104.02 294 102.453 295.567 102.453 297.5C102.453 299.433 104.02 301 105.953 301Z"
      fill="black"
    />

    <Path
      d="M274.888 441.547C278.478 441.547 281.388 438.637 281.388 435.047C281.388 431.457 278.478 428.547 274.888 428.547C271.298 428.547 268.388 431.457 268.388 435.047C268.388 438.637 271.298 441.547 274.888 441.547Z"
      fill="white"
    />

    <Path
      d="M273.241 426.4V423.333M273.241 416.267V413.199M274.072 401.987C273.524 402.059 273.14 402.561 273.183 403.112M270.109 392.424C269.671 392.76 269.591 393.387 269.904 393.842M261.896 386.117C261.685 386.627 261.928 387.21 262.426 387.448M252.003 384.6H253.003L254.241 385.6M243.057 384.6H244.057M234.11 384.6H235.11M225.163 384.6H226.163M215.981 384.6H216.981M206.095 384.6H207.095M196.208 384.6H197.208M186.323 384.6H187.323M176.282 384.429C176.21 384.976 176.595 385.481 177.146 385.526M166.673 380.421C166.335 380.858 166.414 381.488 166.866 381.805M160.375 372.129C159.863 372.337 159.614 372.922 159.847 373.423M157.91 364.408V362.972M157.986 356.045V355.59"
      stroke="black"
      strokeOpacity={0.7}
      strokeWidth={4}
    />

    <Path
      d="M158.5 352C160.432 352 162 350.433 162 348.5C162 346.567 160.432 345 158.5 345C156.567 345 155 346.567 155 348.5C155 350.433 156.567 352 158.5 352Z"
      fill="black"
    />

    <Path
      d="M90 72C90 71.4477 90.4477 71 91 71H91.9053M98.7148 72H99.7148M110.335 72H111.335M121.955 72H122.955M132.83 79.0506C132.682 78.5182 132.917 77.9337 133.428 77.7217"
      stroke="black"
      strokeOpacity={0.7}
      strokeWidth={4}
    />

    <Path
      d="M134.431 89.2705C136.364 89.2705 137.931 87.7035 137.931 85.7705C137.931 83.8375 136.364 82.2705 134.431 82.2705C132.498 82.2705 130.931 83.8375 130.931 85.7705C130.931 87.7035 132.498 89.2705 134.431 89.2705Z"
      fill="black"
    />

    <Path
      d="M90 448C90 447.448 90.4477 447 91 447H91.9053M98.7148 448H99.7148M110.335 448H111.335M121.955 448H122.955M132.83 455.051C132.682 454.518 132.917 453.934 133.428 453.722"
      stroke="black"
      strokeOpacity={0.7}
      strokeWidth={4}
    />

    <Path
      d="M134.5 468.271C136.433 468.271 138 466.704 138 464.771C138 462.838 136.433 461.271 134.5 461.271C132.567 461.271 131 462.838 131 464.771C131 466.704 132.567 468.271 134.5 468.271Z"
      fill="black"
    />

    <Path
      d="M235.095 135H236.095M223.475 135H224.475M211.854 135H212.854M200.149 135.704C199.379 135.194 199.621 134.604 200.149 134.443M192.882 143.752C192.924 142.897 193.072 142.069 193.311 141.28"
      stroke="black"
      strokeOpacity={0.7}
      strokeWidth={4}
    />

    <Path
      d="M193.5 154.271C191.567 154.271 190 152.704 190 150.771C190 148.838 191.567 147.271 193.5 147.271C195.433 147.271 197 148.838 197 150.771C197 152.704 195.433 154.271 193.5 154.271Z"
      fill="black"
    />

    <Path
      d="M234.095 483.271H235M222.475 483.271H226.285M210.854 483.271H214.665M192.572 476.549C192.062 476.76 191.472 476.519 191.311 475.991"
      stroke="black"
      strokeOpacity={0.7}
      strokeWidth={4}
    />

    <Path
      d="M191.5 470C189.567 470 188 468.433 188 466.5C188 464.567 189.567 463 191.5 463C193.433 463 195 464.567 195 466.5C195 468.433 193.433 470 191.5 470Z"
      fill="black"
    />
  </Svg>
);

const IconAt = ({
  source,
  cx,
  cy,
  size,
}: {
  source: any;
  cx: number;
  cy: number;
  size: number;
}) => (
  <Image
    source={source}
    style={{
      position: "absolute",
      left: cx - size / 2,
      top: cy - size / 2,
      width: size,
      height: size,
    }}
    resizeMode="contain"
  />
);

const Login = () => {
  const router = useRouter();

  const backbg = require("../assets/photo/login/2.0/home.png");

  const centerLogo = require("../assets/photo/login/2.0/n9.png");

  const buttonBg = require("../assets/photo/login/2.0/button.png");

  const n1 = require("../assets/photo/login/2.0/n1.png");

  const n2 = require("../assets/photo/login/2.0/n2.png");

  const n3 = require("../assets/photo/login/2.0/n3.png");

  const n4 = require("../assets/photo/login/2.0/n4.png");

  const n5 = require("../assets/photo/login/2.0/n5.png");

  const n6 = require("../assets/photo/login/2.0/n6.png");

  const n7 = require("../assets/photo/login/2.0/n7.png");

  const n8 = require("../assets/photo/login/2.0/n8.png");

  const [tapCount, setTapCount] = useState(0);

  const [showDemoLogin, setShowDemoLogin] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "241217798940-f6ik71i9je097slar0i4rco98mc1re7m.apps.googleusercontent.com",

      iosClientId:
        "241217798940-ipmglh828epjv8q7v0ob4lrf2pvnuhs3.apps.googleusercontent.com",

      offlineAccess: true,

      scopes:
        Platform.OS === "android"
          ? [
              "profile",
              "email",
              "https://www.googleapis.com/auth/fitness.activity.read",
            ]
          : ["profile", "email"],
    });
  }, []);

  const handleSecretTap = () => {
    if (showDemoLogin) return;

    if (tapCount + 1 >= 5) {
      setShowDemoLogin(true);
      setTapCount(0);
      Alert.alert("Developer Mode", "Demo Login Enabled!");
    } else setTapCount(tapCount + 1);
  };

  const onDemoLoginPress = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter demo email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert("Demo Login Failed", error.message);
    else router.replace("/(tabs)/home");

    setLoading(false);
  };

  const onGoogleButtonPress = async () => {
    try {
      if (Platform.OS === "android") await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error("Login was cancelled.");

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        Alert.alert("Supabase Error", error.message);
        return;
      }

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
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });

        if (error) Alert.alert("Supabase Error", error.message);
        else router.replace("/(tabs)/home");
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") Alert.alert("Error", e.message);
    }
  };

  const LOGO_SIZE = 190;

  const LOGO_CX = 163;

  const LOGO_CY = 290;

  return (
    <ImageBackground source={backbg} className="flex-1" resizeMode="cover">
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <SafeAreaView className="flex-1 justify-between">
            <View className="flex-1 items-center justify-center">
              <View style={{ width: 343, height: 549 }}>
                {/* Static SVG Path */}

                <OnboardingPath />

                {/* 4 Moving dots — follow actual path waypoints */}

                {/* Path 1: TL */}

                <MovingDash
                  duration={2500}
                  points={[
                    { x: 52, y: 129 },
                    { x: 52, y: 150 },
                    { x: 52, y: 170 },

                    { x: 52, y: 186 },
                    { x: 56, y: 197 },
                    { x: 63, y: 204 },

                    { x: 84, y: 206 },
                    { x: 116, y: 206 },
                    { x: 138, y: 206 },

                    { x: 148, y: 206 },
                    { x: 157, y: 210 },
                    { x: 164, y: 218 },

                    { x: 166, y: 226 },
                    { x: 165, y: 237 },
                  ]}
                />

                {/* Path 2: TR */}

                <MovingDash
                  duration={2800}
                  points={[
                    { x: 278, y: 185 },
                    { x: 278, y: 201 },
                    { x: 278, y: 220 },

                    { x: 278, y: 239 },
                    { x: 278, y: 257 },
                    { x: 278, y: 268 },

                    { x: 277, y: 279 },
                    { x: 273, y: 289 },
                    { x: 265, y: 295 },

                    { x: 248, y: 297 },
                    { x: 226, y: 297 },
                    { x: 220, y: 297 },
                  ]}
                />

                {/* Path 3: BL */}

                <MovingDash
                  duration={2200}
                  points={[
                    { x: 48, y: 405 },
                    { x: 48, y: 384 },
                    { x: 48, y: 356 },

                    { x: 48, y: 328 },
                    { x: 48, y: 315 },
                    { x: 53, y: 305 },

                    { x: 61, y: 299 },
                    { x: 79, y: 297 },
                    { x: 89, y: 297 },

                    { x: 101, y: 297 },
                    { x: 106, y: 297 },
                  ]}
                />

                {/* Path 4: BR — reversed to fix rotation direction */}

                <MovingDash
                  duration={3000}
                  points={[
                    { x: 158, y: 349 },
                    { x: 158, y: 356 },
                    { x: 160, y: 372 },
                    { x: 167, y: 380 },
                    { x: 176, y: 385 },
                    { x: 186, y: 385 },
                    { x: 215, y: 385 },
                    { x: 243, y: 385 },
                    { x: 262, y: 386 },
                    { x: 270, y: 392 },
                    { x: 274, y: 402 },
                    { x: 273, y: 413 },
                    { x: 273, y: 426 },
                  ]}
                />

                {/* Icons */}

                <IconAt source={n3} cx={51} cy={70} size={120} />

                <IconAt source={n4} cx={278} cy={130} size={120} />

                <IconAt source={n2} cx={49} cy={475} size={120} />

                <IconAt source={n1} cx={274} cy={490} size={120} />

                <IconAt source={n5} cx={130} cy={120} size={40} />

                <IconAt source={n6} cx={190} cy={180} size={40} />

                <IconAt source={n7} cx={195} cy={445} size={40} />

                <IconAt source={n8} cx={135} cy={495} size={40} />

                {/* Center Logo */}

                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleSecretTap}
                  style={{
                    position: "absolute",
                    left: LOGO_CX - LOGO_SIZE / 2,
                    top: LOGO_CY - LOGO_SIZE / 2,
                    width: LOGO_SIZE,
                    height: LOGO_SIZE,
                  }}
                >
                  <Image
                    source={centerLogo}
                    style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              {showDemoLogin && (
                <View className="w-[90%] bg-white/90 p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
                  <Text className="text-center font-bold mb-2 text-gray-500">
                    Reviewer Login
                  </Text>

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
                      <Text className="text-white font-bold">
                        Login as Demo User
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowDemoLogin(false)}
                    className="mt-2 items-center"
                  >
                    <Text className="text-red-500 text-xs">Hide</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="w-full px-8 mb-12">
              <ImageBackground
                source={buttonBg}
                resizeMode="cover"
                style={{
                  borderRadius: 50,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <TouchableOpacity
                  onPress={onGoogleButtonPress}
                  activeOpacity={0.9}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 16,
                    gap: 12,
                  }}
                >
                  <B1 />

                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                  >
                    Sign in with Google
                  </Text>
                </TouchableOpacity>
              </ImageBackground>

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={onAppleButtonPress}
                  activeOpacity={0.9}
                  className="bg-white flex-row items-center justify-center py-4 rounded-full border shadow-lg gap-3"
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
    </ImageBackground>
  );
};

export default Login;
