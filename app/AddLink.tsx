import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageBackground,
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

const buttonBg = require("../assets/2.0/model/button.png");

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
        style={{
          backgroundColor: '#19181B',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: Platform.OS === "android" ? isKeyboardOpen ? "85%" : "60%" : "78%",
        }}
      >
        {/* Drag Indicator */}
        <View style={{ width: 48, height: 6, backgroundColor: '#636366', borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 16 }} />

        <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 }}>
          Add Feeds
        </Text>

        <View style={{ paddingHorizontal: 24, flex: 1 }}>

          {/* INPUT WITH PASTE */}
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <TextInput
              placeholder="Enter link"
              placeholderTextColor="#636366"
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                if (text.trim() === "") setPreviewData(null);
                else handleFetch(text);
              }}
              autoCapitalize="none"
              style={{ flex: 1, fontSize: 14, color: '#FFFFFF' }}
            />
            <TouchableOpacity onPress={handlePaste}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#636366' }}>PASTE</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {loading && <ActivityIndicator size="large" color="#FFFFFF" />}

            {/* PREVIEW CARD */}
            {previewData && (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 8, marginBottom: 20 }}>
                <Image
                  source={{ uri: previewData.images?.[0] || previewData.image }}
                  style={{ width: '100%', height: 208, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={{ uri: `https://www.google.com/s2/favicons?domain=${getDomain(formatUrl(url))}&sz=64` }}
                      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    />
                    <Text style={{ marginLeft: 12, fontSize: 13, color: '#AFAFAF', flex: 1 }} numberOfLines={2}>
                      {previewData.description || previewData.title}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* SAVE BUTTON */}
        <View style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 30, paddingHorizontal: 24, paddingTop: 10 }}>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={{ height: 56, borderRadius: 18, overflow: 'hidden' }}>
            <ImageBackground
              source={buttonBg}
              style={{ width: '100%', height: 56, alignItems: 'center', justifyContent: 'center' }}
              imageStyle={{ borderRadius: 18 }}
              resizeMode="cover"
            >
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: 0.3 }}>Save</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </Modal>
  );
}