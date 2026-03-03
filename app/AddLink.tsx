import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
   useWindowDimensions
} from "react-native";
import Modal from "react-native-modal";
import * as Clipboard from "expo-clipboard";
import { getLinkPreview } from "link-preview-js";
import { supabase } from "../lib/supabase";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddLinkModal({ visible, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const formatUrl = (text: string) => {
    if (!text.startsWith("http")) return "https://" + text;
    return text;
  };

  const getDomain = (link: string) => {
    try {
      return new URL(link).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    setUrl(text);
    handleFetch(text);
  };

  const handleFetch = async (text: string) => {
    setUrl(text);

    if (!text || text.trim() === "") {
      setPreviewData(null);   // 👈 CARD REMOVE
      return;
    }

    const formatted = formatUrl(text);

    if (!formatted.match(/https?:\/\/[^\s]+/)) {
      setPreviewData(null);
      return;
    }

    setLoading(true);

    try {
      const data = await getLinkPreview(formatted, {
        headers: { "user-agent": "googlebot" },
      });
      setPreviewData(data);
    } catch {
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!previewData) return;

    const finalUrl = formatUrl(url);
    const domain = getDomain(finalUrl);

    await supabase.from("links").insert([
      {
        url: finalUrl,
        title: previewData.title || "",
        description:
          previewData.description ||
          previewData.title ||
          "No description available",
        image:
          previewData.images?.[0] ||
          previewData.image ||
          null,
        username: domain.split(".")[0] || domain,
        logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      },
    ]);

    setUrl("");
    setPreviewData(null);
    onClose();
  };

  useEffect(() => {
  const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
    setKeyboardHeight(e.endCoordinates.height);
    setIsKeyboardOpen(true);
  });

  const hideSub = Keyboard.addListener("keyboardDidHide", () => {
    setKeyboardHeight(0);
    setIsKeyboardOpen(false);
  });

  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, []);

  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="bg-white rounded-t-3xl"
        style={{
  height:
    Platform.OS === "android"
      ? isKeyboardOpen
        ? "85%"
        : "60%"
      : "78%",
}}
      >
        {/* Drag Indicator */}
        <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mt-3 mb-4" />

        <Text className="text-lg font-semibold text-center mb-4">
          Add Feeds
        </Text>

        <View className="px-6 flex-1">

          {/* INPUT WITH PASTE */}
          <View className="flex-row items-center border border-gray-300 rounded-xl px-3 h-12 mb-5">
            <TextInput
              placeholder="Enter portfolio link"
              placeholderTextColor={'#AEAEB2'}
              value={url}
              onChangeText={(text) => {
                setUrl(text);

                if (text.trim() === "") {
                  setPreviewData(null);
                } else {
                  handleFetch(text);
                }
              }}
              autoCapitalize="none"
              className="flex-1 text-sm"
            />

            <TouchableOpacity onPress={handlePaste}>
              <Text className="text-sm font-semibold text-black">
                PASTE
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {loading && <ActivityIndicator size="large" />}

            {/* SAME CARD AS EXPLORE */}
            {previewData && (
              <View className="bg-white rounded-2xl overflow-hidden shadow-sm p-2 mb-5">

                <Image
                  source={{
                    uri:
                      previewData.images?.[0] ||
                      previewData.image,
                  }}
                  className="w-full h-52 rounded-t-2xl"
                  resizeMode="cover"
                />

                <View className="px-4 py-4 bg-white">
                  <View className="flex-row items-center">
                    <Image
                      source={{
                        uri: `https://www.google.com/s2/favicons?domain=${getDomain(
                          formatUrl(url)
                        )}&sz=64`,
                      }}
                      className="w-10 h-10 rounded-full bg-gray-200"
                    />

                    <Text
                      className="ml-3 text-sm text-[#8E8E93] flex-1"
                      numberOfLines={2}
                    >
                      {previewData.description ||
                        previewData.title}
                    </Text>
                  </View>
                </View>

              </View>
            )}
          </ScrollView>
        </View>

        {/* FIXED SAVE BUTTON */}
        <View
  style={{
    paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 30,
    paddingHorizontal: 24,
    paddingTop: 10,
  }}
>
  <TouchableOpacity
    onPress={handleSave}
    className="bg-black h-14 rounded-2xl items-center justify-center"
  >
    <Text className="text-white text-base font-semibold">
      Save
    </Text>
  </TouchableOpacity>
</View>

      </KeyboardAvoidingView>
    </Modal>
  );
}