import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { deleteApiKey, getStoredApiKey, saveApiKey } from "../../lib/gemini";

const homeBg = require("../../assets/photo/login/2.0/home.png");
const buttonBg = require("../../assets/2.0/model/button.png");

export default function AiSettingsScreen() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    (async () => {
      const key = await getStoredApiKey();
      if (key) {
        setApiKey(key);
        setSaved(true);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    try {
      await saveApiKey(apiKey);
      setSaved(true);
      Alert.alert("Saved", "Your Gemini API key has been securely saved.");
    } catch {
      Alert.alert("Error", "Failed to save API key.");
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Remove Key",
      "Are you sure you want to remove your Gemini API key?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deleteApiKey();
            setApiKey("");
            setSaved(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const hasKey = apiKey.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ backgroundColor: "rgba(255,255,255,0.08)", padding: 8, borderRadius: 50 }}
              >
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#fff", position: "absolute", left: 0, right: 0, textAlign: "center", zIndex: -1 }}>
                Gemini AI
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 32 }}>

              {/* Icon + Title */}
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>✨</Text>
                <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 8 }}>
                  Gemini API Key
                </Text>
                <Text style={{ fontSize: 13, color: "#636366", lineHeight: 20, textAlign: "center", paddingHorizontal: 12 }}>
                  Enter your Google AI Studio API key to enable the AI Chat feature. It is stored securely on your device and never shared with anyone except Google's services.
                </Text>
              </View>

              {/* Input field */}
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 14,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                marginBottom: 12,
              }}>
                <TextInput
                  style={{ flex: 1, paddingVertical: 14, fontSize: 14, color: "#fff" }}
                  placeholder="Paste your Gemini API Key"
                  placeholderTextColor="#636366"
                  value={apiKey}
                  onChangeText={(t) => { setApiKey(t); setSaved(false); }}
                  secureTextEntry={!showKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowKey((prev) => !prev)} style={{ paddingLeft: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#636366", letterSpacing: 0.5 }}>
                    {showKey ? "HIDE" : "SHOW"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Saved indicator */}
              {saved && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4, marginBottom: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#30D158" }} />
                  <Text style={{ color: "#30D158", fontSize: 13, fontWeight: "600" }}>API Key saved</Text>
                </View>
              )}
            </View>

            {/* Bottom buttons */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12 }}>

              {/* Save button — button.png */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={!hasKey}
                activeOpacity={0.85}
                style={{ width: "100%", marginBottom: 14, opacity: hasKey ? 1 : 0.4 }}
              >
                <ImageBackground
                  source={buttonBg}
                  style={{ width: "100%", height: 56, alignItems: "center", justifyContent: "center", borderRadius: 18, overflow: "hidden" }}
                  imageStyle={{ borderRadius: 18 }}
                  resizeMode="cover"
                >
                  <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600", letterSpacing: 0.3 }}>
                    Save API Key
                  </Text>
                </ImageBackground>
              </TouchableOpacity>

              {/* Remove key */}
              <TouchableOpacity onPress={handleCancel} style={{ alignItems: "center", paddingVertical: 6 }}>
                <Text style={{ color: "#FF453A", fontSize: 14, fontWeight: "500" }}>Remove Key</Text>
              </TouchableOpacity>

            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
