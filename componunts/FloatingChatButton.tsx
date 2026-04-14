import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AI1 from '../assets/photo/home/AI1.svg';
import { GeminiResponse, getStoredApiKey, sendMessage } from "../lib/gemini";
import { todoEvents } from "../lib/todoEvents";
import { addTasksToDailyLog, removeTasksFromDailyLog } from "../lib/todoService";
import { getTodayLog, updateDailyLog } from "../lib/TrackerService";
import ChatBubble from "./ChatBubble";

const CHAT_HISTORY_KEY = "chat_history";
const MAX_HISTORY = 20;

type Message = {
  id: string;
  role: "user" | "model" | "system" | "error";
  text: string;
};

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isAtBottom = useRef(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const onShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    };
    const onHide = () => setKeyboardHeight(0);
    const showSub = Keyboard.addListener("keyboardDidShow", onShow);
    const hideSub = Keyboard.addListener("keyboardDidHide", onHide);
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch (e) {}
  };

  const saveHistory = async (msgs: Message[]) => {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs));
    } catch (e) {}
  };

  const clearHistory = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all chat history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear", style: "destructive",
        onPress: async () => {
          setMessages([]);
          await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
        },
      },
    ]);
  };

  useEffect(() => {
    (async () => {
      const key = await getStoredApiKey();
      setHasKey(!!key);
    })();
  }, [isOpen]);

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setIsOpen((prev) => !prev);
  };

  const appendMessage = (role: Message["role"], text: string) => {
    setMessages((prev) => {
      const updated = [...prev, { id: Date.now().toString() + Math.random(), role, text }];
      saveHistory(updated);
      return updated;
    });
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const emitRefresh = () => {
    todoEvents.emit();
    setTimeout(() => todoEvents.emit(), 2000);
  };

  const handleToolCall = async (functionName: string, args: Record<string, any>) => {
    if (functionName === "add_todo") {
      const newTasks: { text: string }[] = args.tasks ?? [];
      if (newTasks.length === 0) { appendMessage("model", "I couldn't find any tasks to add. Please mention what you want to add."); return; }
      try {
        const result = await addTasksToDailyLog(newTasks);
        if (!result.success) { appendMessage("model", result.error ?? "Could not add tasks."); return; }
        const addedCount = newTasks.length;
        const taskLines = newTasks.map((t) => `• ${t.text}`).join("\n");
        const remaining = result.merged.filter((m) => m.text.trim() !== "").length;
        appendMessage("model", `✅ ${addedCount} task${addedCount > 1 ? "s" : ""} added:\n${taskLines}\n${remaining}/3 tasks in your list.`);
        if (result.error) appendMessage("error", result.error);
        emitRefresh();
      } catch { appendMessage("model", "Sorry, I couldn't add the tasks. Please try again."); }
    } else if (functionName === "remove_todo") {
      const tasksToRemove: { text: string }[] = args.tasks ?? [];
      const removeAll: boolean = args.removeAll ?? false;
      if (!removeAll && tasksToRemove.length === 0) { appendMessage("model", "Please tell me which task you want to remove."); return; }
      try {
        const result = await removeTasksFromDailyLog(tasksToRemove, removeAll);
        if (!result.success) { appendMessage("model", "Your todo list is already empty."); return; }
        if (result.removedCount === 0) { appendMessage("model", "I couldn't find that task. Please check the task name."); return; }
        if (removeAll) { appendMessage("model", "✅ All tasks cleared from your todo list."); }
        else { appendMessage("model", `✅ ${result.removedCount} task${result.removedCount > 1 ? "s" : ""} removed.\n${result.remaining.length}/3 tasks remaining.`); }
        emitRefresh();
      } catch { appendMessage("model", "Sorry, I couldn't remove the task. Please try again."); }
    } else if (functionName === "set_meditation") {
      const time: string = args.time ?? "10m";
      try {
        const result = await updateDailyLog("meditation", time);
        if (!result.success) { appendMessage("model", "Could not update meditation. Please try again."); return; }
        appendMessage("model", `🧘 Meditation updated to ${time}!`);
        emitRefresh();
      } catch { appendMessage("model", "Sorry, I couldn't update meditation. Please try again."); }
    } else if (functionName === "set_water") {
      const liters: number = args.liters ?? 1.5;
      try {
        const result = await updateDailyLog("water", liters);
        if (!result.success) { appendMessage("model", "Could not update water intake. Please try again."); return; }
        appendMessage("model", `💧 Water intake updated to ${liters.toFixed(1)}L!`);
        emitRefresh();
      } catch { appendMessage("model", "Sorry, I couldn't update water intake. Please try again."); }
    } else if (functionName === "set_sleep") {
      const hour: string = args.hour ?? "08";
      const minute: string = args.minute ?? "00";
      const sleepData = { hour: hour.padStart(2, "0"), minute: minute.padStart(2, "0") };
      try {
        const result = await updateDailyLog("sleep", sleepData);
        if (!result.success) { appendMessage("model", "Could not update sleep. Please try again."); return; }
        appendMessage("model", `😴 Sleep updated to ${sleepData.hour}h ${sleepData.minute}m!`);
        emitRefresh();
      } catch { appendMessage("model", "Sorry, I couldn't update sleep. Please try again."); }
    } else if (functionName === "set_workout") {
      const hour: string = args.hour ?? "00";
      const minute: string = args.minute ?? "30";
      const workoutData = { hour: hour.padStart(2, "0"), minute: minute.padStart(2, "0") };
      try {
        const result = await updateDailyLog("workout", workoutData);
        if (!result.success) { appendMessage("model", "Could not update workout. Please try again."); return; }
        appendMessage("model", `💪 Workout updated to ${workoutData.hour}h ${workoutData.minute}m!`);
        emitRefresh();
      } catch { appendMessage("model", "Sorry, I couldn't update workout. Please try again."); }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!hasKey) {
      Alert.alert("No API Key", "Please add your Gemini API key in Settings first.",
        [{ text: "Go to Settings", onPress: () => { setIsOpen(false); router.push("/settings/ai"); } }]);
      return;
    }
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input.trim() };
    const currentHistory = messages
      .filter((m) => m.role === "user" || m.role === "model")
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role as "user" | "model", text: m.text }));
    setMessages((prev) => { const updated = [...prev, userMsg]; saveHistory(updated); return updated; });
    setInput("");
    setLoading(true);
    try {
      const todayLog = await getTodayLog();
      const liveTodos: { text: string; isDone: boolean }[] = todayLog?.todo_list ?? [];
      const liveHealth = {
        meditation: todayLog?.meditation_time,
        water: todayLog?.water_intake,
        sleep: todayLog?.sleep_data,
        workout: todayLog?.workout_time,
      };
      const response: GeminiResponse = await sendMessage(currentHistory, userMsg.text, liveTodos, liveHealth);
      if (response.type === "text") { appendMessage("model", response.text); }
      else if (response.type === "tool_call") { await handleToolCall(response.functionName, response.args); }
      else if (response.type === "multi_tool_call") { for (const call of response.calls) { await handleToolCall(call.functionName, call.args); } }
    } catch (error: any) {
      const isNoKey = error?.message === "NO_API_KEY";
      let title = "Error";
      let message = error?.message || "Unknown error occurred.";
      if (isNoKey) { title = "No API Key"; message = "Please add your Gemini API key in Settings."; }
      else if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("invalid")) { title = "Invalid API Key"; message = "Your API key is invalid."; }
      else if (error?.message?.includes("quota") || error?.message?.includes("QUOTA")) { title = "Quota Exceeded"; message = "Your API quota is exceeded. Try again later."; }
      Alert.alert(title, message, [{ text: isNoKey ? "Go to Settings" : "OK", onPress: isNoKey ? () => { setIsOpen(false); router.push("/settings/ai"); } : undefined }]);
    } finally { setLoading(false); }
  };

  const NoKeyBanner = () =>
    hasKey === false ? (
      <TouchableOpacity onPress={() => { setIsOpen(false); router.push("/settings/ai"); }}
        className="mx-4 mt-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex-row items-center">
        <Ionicons name="warning-outline" size={18} color="#d97706" />
        <Text className="text-amber-700 text-sm ml-2 flex-1">No API key found. Tap to add your Gemini key in Settings.</Text>
        <Ionicons name="chevron-forward" size={16} color="#d97706" />
      </TouchableOpacity>
    ) : null;

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-5xl mb-4">✨</Text>
      <Text className="text-xl font-bold text-gray-700 mb-2">Health Assistant</Text>
      <Text className="text-gray-400 text-center text-sm leading-6">
        Track your daily health by chatting!{"\n\n"}
        🧘 "Meditated for 20 mins"{"\n"}
        💧 "Drank 2 liters of water"{"\n"}
        😴 "Slept for 8 hours"{"\n"}
        💪 "Gym karyu 45 min"{"\n"}
        ✅ "Add buy groceries to todo"
      </Text>
    </View>
  );

  const TAB_BAR_HEIGHT = 90;
  const BUTTON_BOTTOM = TAB_BAR_HEIGHT + 16;

  return (
    <>
      {/* Floating Button */}
      <Animated.View style={{ position: "absolute", bottom: BUTTON_BOTTOM, right: 20, zIndex: 999, transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity onPress={handleButtonPress} activeOpacity={0.9}
          className="w-[60px] h-[60px] rounded-[18px] items-center justify-center"
          // style={{ shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 10 }}
          >
          {/* <LinearGradient
            colors={["#a855f7", "#6366f1", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-[60px] h-[60px] rounded-[18px] items-center justify-center border-2 border-white/30"> */}
            <View className="rounded-[16px] overflow-hidden">
              <AI1 width={48} height={48} />
            </View>
          {/* </LinearGradient> */}
        </TouchableOpacity>
      </Animated.View>

      {/* Modal */}
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/30"
            activeOpacity={1} onPress={() => setIsOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
            <View
              className="bg-white rounded-t-3xl overflow-hidden"
              style={{
                height: keyboardHeight > 0 ? 580 - keyboardHeight + 260 : 580,
                marginBottom: Platform.OS === "android" ? keyboardHeight : 0
              }}>

              {/* Drag Handle */}
              <View className="items-center pt-2.5 pb-1">
                <View className="w-10 h-1 rounded-full bg-gray-200" />
              </View>

              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={18} color="#3b82f6" />
                  <Text className="text-base font-bold text-gray-800 ml-1.5">Health Assistant</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  {messages.length > 0 && (
                    <TouchableOpacity onPress={clearHistory} className="p-2">
                      <Ionicons name="trash-outline" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2">
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>

              <NoKeyBanner />

              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatBubble role={item.role} text={item.text} />}
                contentContainerStyle={messages.length === 0 ? { flex: 1 } : { paddingVertical: 12 }}
                ListEmptyComponent={<EmptyState />}
                onContentSizeChange={() => { if (isAtBottom.current) flatListRef.current?.scrollToEnd({ animated: true }); }}
                onScroll={({ nativeEvent }) => {
                  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                  isAtBottom.current = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
                }}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
              />

              {/* Loading */}
              {loading && (
                <View className="flex-row items-center px-4 pb-2">
                  <View className="bg-gray-100 rounded-2xl px-4 py-2.5 flex-row items-center">
                    <ActivityIndicator size="small" color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-2">Thinking…</Text>
                  </View>
                </View>
              )}

              {/* Input */}
              <View
                className="flex-row items-end px-3 pt-2.5 border-t border-gray-100 bg-white"
                style={{ paddingBottom: Platform.OS === "android" ? 35 : insets.bottom + 12 }}>
                <TextInput
                  className="flex-1 bg-gray-100 rounded-[20px] px-4 py-2.5 text-[15px] text-gray-800"
                  style={{ maxHeight: 120 }}
                  placeholder="Meditation, water, sleep, workout, todos..."
                  placeholderTextColor="#9ca3af"
                  value={input}
                  onChangeText={setInput}
                  multiline
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={loading || !input.trim()}
                  className={`ml-2 mb-0.5 w-[42px] h-[42px] rounded-full items-center justify-center ${input.trim() && !loading ? "bg-blue-500" : "bg-gray-200"}`}>
                  <Ionicons name="arrow-up" size={20} color={input.trim() && !loading ? "white" : "#9ca3af"} />
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
