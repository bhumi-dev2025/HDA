import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getLinkPreview } from "link-preview-js";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";


const ADMIN_EMAIL = "simplebhumidev@gmail.com";

export default function AddLink() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.email !== ADMIN_EMAIL) {
      Alert.alert("Access Denied");
      router.back();
    }
  };

  const handleFetch = async (text: string) => {
    setUrl(text);
    if (text.match(/https?:\/\/[^\s]+/)) {
      setLoading(true);
      try {
        const data = await getLinkPreview(text, {
          headers: { "user-agent": "googlebot" },
        });
        setPreviewData(data);
      } catch {
        setPreviewData(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!previewData) return;

    await supabase.from("links").insert([
      {
        url,
        title: previewData.title,
        description: previewData.description,
        image: previewData.images?.[0] || previewData.image || null,
        username: new URL(url).hostname.replace("www.", "").split(".")[0],
        logo: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
      },
    ]);

    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-6">
        <Text className="text-2xl font-bold mb-4">Add New Link</Text>

        <TextInput
          placeholder="Paste link..."
          value={url}
          onChangeText={handleFetch}
          autoCapitalize="none"
          className="bg-white p-4 rounded-2xl border border-gray-200 mb-6"
        />

        {loading && <ActivityIndicator size="large" />}

        {previewData && (
  <>
    <View className="bg-white rounded-[32px] overflow-hidden shadow-md">

      {/* IMAGE BACKGROUND */}
      <ImageBackground
        source={{
          uri:
            previewData.images?.[0] ||
            previewData.image,
        }}
        className="w-full h-64 justify-end"
        resizeMode="cover"
      >
        {/* HEX GRADIENT */}
        <LinearGradient
          colors={["#00000000", "#000000E6"]}
          className="w-full px-5 pb-5 pt-16"
        >
          <Text
            className={`text-white text-xl font-bold ${
              Platform.OS === "ios" ? "m-4" : ""
            }`}
            numberOfLines={2}
          >
            {previewData.description}
          </Text>
        </LinearGradient>
      </ImageBackground>

      {/* USER INFO */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center">
          <Image
            source={{
              uri: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
            }}
            className="w-10 h-10 rounded-full bg-gray-200"
          />
          <View className="ml-3">
            <Text className="text-base font-semibold text-gray-900">
              {new URL(url).hostname.replace("www.", "").split(".")[0]}
            </Text>
            <Text className="text-xs text-gray-400">
              Tap to view
            </Text>
          </View>
        </View>
      </View>
    </View>

    <TouchableOpacity
      onPress={handleSave}
      className="bg-black p-4 rounded-2xl mt-6"
    >
      <Text className="text-white text-center font-bold">
        Save Link
      </Text>
    </TouchableOpacity>
  </>
)}


      </ScrollView>
    </SafeAreaView>
  );
}
