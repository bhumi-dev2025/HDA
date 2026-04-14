import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter a valid API key.");
      return;
    }
    try {
      await saveApiKey(apiKey);
      setSaved(true);
      Alert.alert("✅ Saved", "Your Gemini API key has been securely saved.");
    } catch {
      Alert.alert("Error", "Failed to save API key.");
    }
  };

  const handleDelete = async () => {
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
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Title */}
      <Text className="text-2xl font-bold text-gray-800 mb-1">
        Gemini API Key
      </Text>
      <Text className="text-sm text-gray-500 mb-6">
        Enter your Google AI Studio API key to enable the AI Chat feature. It
        is stored securely on your device and never shared with anyone except
        Google's servers.
      </Text>

      {/* Info box */}
      <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex-row items-start">
        <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
        <Text className="text-blue-700 text-sm ml-2 flex-1">
          Get your free key at{" "}
          <Text className="font-bold">aistudio.google.com</Text>
        </Text>
      </View>

      {/* Security note */}
      <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex-row items-start">
        <Ionicons name="shield-checkmark-outline" size={18} color="#16a34a" />
        <Text className="text-green-700 text-sm ml-2 flex-1">
          Stored using <Text className="font-bold">expo-secure-store</Text> —
          encrypted on your device's secure keychain. Never leaves your device
          except to call the Gemini API directly.
        </Text>
      </View>

      {/* Input label */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        Gemini API Key
      </Text>

      {/* Key input row */}
      <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 mb-2 shadow-sm">
        <TextInput
          className="flex-1 py-3 text-gray-800 text-sm"
          placeholder="AIzaSy..."
          value={apiKey}
          onChangeText={(t) => {
            setApiKey(t);
            setSaved(false);
          }}
          secureTextEntry={!showKey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setShowKey((prev) => !prev)}
          className="pl-2"
        >
          <Ionicons
            name={showKey ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#6b7280"
          />
        </TouchableOpacity>
      </View>

      {/* Saved badge */}
      {saved && (
        <View className="flex-row items-center mb-4 ml-1">
          <Ionicons name="checkmark-circle" size={15} color="#22c55e" />
          <Text className="text-green-600 text-xs ml-1 font-medium">
            Key saved securely on this device
          </Text>
        </View>
      )}

      {/* Save button */}
      <TouchableOpacity
        onPress={handleSave}
        className="bg-blue-500 rounded-xl py-4 items-center mb-3 mt-4 shadow"
      >
        <Text className="text-white font-bold text-base">Save API Key</Text>
      </TouchableOpacity>

      {/* Delete button — only shown when a key exists */}
      {saved && (
        <TouchableOpacity
          onPress={handleDelete}
          className="border border-red-400 rounded-xl py-4 items-center"
        >
          <Text className="text-red-500 font-semibold text-base">
            Remove API Key
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
