import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteApiKey, getStoredApiKey, saveApiKey } from "../../lib/gemini";

export default function AiSettingsScreen() {
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const hasKey = apiKey.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Content area */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>

        {/* Title */}
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 6 }}>
          Gemini
        </Text>

        {/* Subtitle */}
        <Text style={{ fontSize: 13, color: "#888", lineHeight: 19, marginBottom: 20 }}>
          Enter your Google AI Studio API key to enable the AI Chat feature. IT
          is stored securely on your device and never shared with anyone except
          Google's services.
        </Text>

        {/* Input field */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ebebeb",
            borderRadius: 10,
            paddingHorizontal: 14,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 13,
              fontSize: 14,
              color: "#111",
            }}
            placeholder="Gemini API Key"
            placeholderTextColor="#aaa"
            value={apiKey}
            onChangeText={(t) => {
              setApiKey(t);
              setSaved(false);
            }}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowKey((prev) => !prev)} style={{ paddingLeft: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#555", letterSpacing: 0.5 }}>
              {showKey ? "HIDE" : "PEST"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Bottom buttons */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12 }}>

        {/* Save API Key button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasKey}
          style={{
            backgroundColor: hasKey ? "#111" : "#c7c7c7",
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Text style={{ color: hasKey ? "#fff" : "#999", fontWeight: "600", fontSize: 15 }}>
            Save API Key
          </Text>
        </TouchableOpacity>

        {/* Cancel now */}
        <TouchableOpacity onPress={handleCancel} style={{ alignItems: "center", paddingVertical: 4 }}>
          <Text style={{ color: "#888", fontSize: 14 }}>Cancel now</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}
