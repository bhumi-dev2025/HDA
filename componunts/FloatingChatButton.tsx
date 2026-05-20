import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
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
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AI1 from '../assets/photo/home/AI1.svg';
import AI4 from '../assets/photo/home/AI4.svg';
import AI5 from '../assets/photo/home/AI5.svg';
import AI6 from '../assets/photo/home/AI6.svg';
import AI7 from '../assets/photo/home/AI7.svg';
import { GeminiResponse, getStoredApiKey, sendMessage } from "../lib/gemini";
import { chatEvents } from "../lib/chatEvents";
import { todoEvents } from "../lib/todoEvents";
import { addTasksToDailyLog, removeTasksFromDailyLog } from "../lib/todoService";
import { getTodayLog, updateDailyLog } from "../lib/TrackerService";
import ChatBubble from "./ChatBubble";

export type FloatingChatButtonHandle = {
  open: () => void;
};


const CHAT_HISTORY_KEY = "chat_history";
const MAX_HISTORY = 20;

type Message = {
  id: string;
  role: "user" | "model" | "system" | "error";
  text: string;
};

type ActiveTab = "todo" | "health";

export default forwardRef<FloatingChatButtonHandle>(function FloatingChatButton(_, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("todo");
  const flatListRef = useRef<FlatList>(null);
  const isAtBottom = useRef(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Ref expose — tab bar thi open kari shakay
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  // chatEvents subscribe — tab bar AI button thi open thay
  useEffect(() => {
    const unsub = chatEvents.subscribe(() => setIsOpen(true));
    return unsub;
  }, []);

  useEffect(() => {
    const onShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    };
    const onHide = () => setKeyboardHeight(0);
    // iOS: keyboardWillShow for smooth animation, Android: keyboardDidShow
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
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
      const response: GeminiResponse = await sendMessage(currentHistory, userMsg.text, activeTab, liveTodos, liveHealth);
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
      <TouchableOpacity
        onPress={() => { setIsOpen(false); router.push("/settings/ai"); }}
        style={{
          marginHorizontal: 16, marginTop: 10,
          backgroundColor: "#FFF8E1",
          borderWidth: 1, borderColor: "#FFD54F",
          borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
          flexDirection: "row", alignItems: "center",
        }}>
        <Ionicons name="warning-outline" size={16} color="#F59E0B" />
        <Text style={{ color: "#92400E", fontSize: 12, marginLeft: 8, flex: 1 }}>
          No API key found. Tap to add your Gemini key in Settings.
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
      </TouchableOpacity>
    ) : null;

  const EmptyState = () => (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
      {activeTab === "todo" ? (
        <View>
          {["Buy groceries", "Call client tomorrow", "Finish project report", "Remove gym task"].map((item, i) => (
            <View key={i} style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: "#F0F0F5",
            }}>
              <Text style={{ fontSize: 14, color: "#C0C0CC", fontWeight: "400" }}>{item}</Text>
              <Ionicons name="arrow-up-outline" size={14} color="#D0D0DC" style={{ transform: [{ rotate: "45deg" }] }} />
            </View>
          ))}
        </View>
      ) : (
        <View>
          {["8.5 Hours Sleep", "10 Min Meditation", "Drank 2 liters water", "Gym workout 45 Min"].map((item, i) => (
            <View key={i} style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: "#F0F0F5",
            }}>
              <Text style={{ fontSize: 14, color: "#C0C0CC", fontWeight: "400" }}>{item}</Text>
              <Ionicons name="arrow-up-outline" size={14} color="#D0D0DC" style={{ transform: [{ rotate: "45deg" }] }} />
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // ── Tab Button ─────────────────────────────────────────────────────────────
  const handleTodoTab = () => setActiveTab("todo");
  const handleHealthTab = () => setActiveTab("health");

  const TAB_BAR_HEIGHT = 90;
  const BUTTON_BOTTOM = TAB_BAR_HEIGHT + 16;

  return (
    <>
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>

          <TouchableOpacity
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.25)" }}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          />
          {/* <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
  <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.25)" }} />
</TouchableWithoutFeedback> */}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
          >
            <View style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              overflow: "hidden",
              height: Platform.OS === "ios"
                ? (keyboardHeight > 0 ? 720 - keyboardHeight : 580)
                : (keyboardHeight > 0 ? 420 : 580),
              marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
            }}>

              {/* Drag Handle */}
              <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB" }} />
              </View>

              {/* Header - sirf empty chat ma dikhe */}
              {messages.length === 0 && (
              <View style={{
                alignItems: "center", paddingTop: 16, paddingBottom: 12,
                borderBottomWidth: 0.5, borderBottomColor: "#F3F4F6",
              }}>
                <View style={{ position: "absolute", right: 12, top: 12, flexDirection: "row", alignItems: "center" }}>
                  {messages.length > 0 && (
                    <TouchableOpacity onPress={clearHistory} style={{ padding: 8 }}>
                      <Ionicons name="trash-outline" size={18} color="#C4C4D0" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setIsOpen(false)} style={{ padding: 8 }}>
                    <Ionicons name="chevron-down" size={20} color="#C4C4D0" />
                  </TouchableOpacity>
                </View>

                {/* AI Icon - Rounded Corners */}
                <View style={{
                  marginBottom: 10,
                  borderRadius: 10,
                  overflow: "hidden",
                  width: 52,
                  height: 52,
                }}>
                  <AI1 width={52} height={52} />
                </View>

                {/* Gradient Title */}
                <MaskedView
                  maskElement={
                    <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4, letterSpacing: 0.2 }}>
                      Health Assistant
                    </Text>
                  }
                >
                  <LinearGradient
                    colors={["#6015C0", "#247FFB"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4, letterSpacing: 0.2, opacity: 0 }}>
                      Health Assistant
                    </Text>
                  </LinearGradient>
                </MaskedView>

                <Text style={{ fontSize: 12, color: "#A0A0B0" }}>
                  Track your daily health by chatting!
                </Text>
              </View>
              )}

              {/* Header with only close/trash - jyare messages hoy */}
              {messages.length > 0 && (
              <View style={{
                flexDirection: "row", justifyContent: "flex-end",
                paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4,
              }}>
                <TouchableOpacity onPress={clearHistory} style={{ padding: 8 }}>
                  <Ionicons name="trash-outline" size={18} color="#C4C4D0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={{ padding: 8 }}>
                  <Ionicons name="chevron-down" size={20} color="#C4C4D0" />
                </TouchableOpacity>
              </View>
              )}

              <NoKeyBanner />

              {/* Chat Messages */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatBubble role={item.role} text={item.text} />}
                contentContainerStyle={messages.length === 0 ? { flex: 1 } : { paddingVertical: 12 }}
                ListEmptyComponent={messages.length === 0 ? <EmptyState /> : null}
                onContentSizeChange={() => {
                  if (isAtBottom.current) flatListRef.current?.scrollToEnd({ animated: true });
                }}
                onScroll={({ nativeEvent }) => {
                  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                  isAtBottom.current = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
                }}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
              />

              {/* Loading */}
              {loading && (
                <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 }}>
                  <View style={{
                    backgroundColor: "#F3F4F6", borderRadius: 16,
                    paddingHorizontal: 14, paddingVertical: 10,
                    flexDirection: "row", alignItems: "center",
                  }}>
                    <ActivityIndicator size="small" color="#6b7280" />
                    <Text style={{ color: "#6B7280", fontSize: 13, marginLeft: 8 }}>Thinking…</Text>
                  </View>
                </View>
              )}

              {/* Bottom — Tab + Input */}
              <View style={{
                borderTopWidth: 0.5, borderTopColor: "#F3F4F6",
                paddingTop: 10, paddingHorizontal: 14,
                paddingBottom: Platform.OS === "ios"
                  ? (keyboardHeight > 0 ? 8 : insets.bottom + 8)
                  : (keyboardHeight > 0 ? 40 : 32),
                backgroundColor: "#FFFFFF",
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
  {/* Todo Tab */}
  <TouchableOpacity
    onPress={() => setActiveTab("todo")}
    activeOpacity={0.8}
    style={{
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 10, marginRight: 8,
      backgroundColor: activeTab === "todo" ? "#FFFFFF" : "transparent",
      borderWidth: activeTab === "todo" ? 1.5 : 0,
      borderColor: activeTab === "todo" ? "#1A1A2E" : "transparent",
    }}
  >
    <AI5
      width={18} height={18}
      color={activeTab === "todo" ? "#1A1A2E" : "#9CA3AF"}
      style={{ marginRight: 5 }}
    />
    <Text style={{ fontSize: 13, fontWeight: "600", color: activeTab === "todo" ? "#1A1A2E" : "#9CA3AF" }}>
      Todo
    </Text>
  </TouchableOpacity>

  {/* Health Tab */}
  <TouchableOpacity
    onPress={() => setActiveTab("health")}
    activeOpacity={0.8}
    style={{
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: activeTab === "health" ? "#FFFFFF" : "transparent",
      borderWidth: activeTab === "health" ? 1.5 : 0,
      borderColor: activeTab === "health" ? "#1A1A2E" : "transparent",
    }}
  >
    <AI4
      width={18} height={18}
      color={activeTab === "health" ? "#1A1A2E" : "#9CA3AF"}
      style={{ marginRight: 5 }}
    />
    <Text style={{ fontSize: 13, fontWeight: "600", color: activeTab === "health" ? "#1A1A2E" : "#9CA3AF" }}>
      Health
    </Text>
  </TouchableOpacity>
</View>

                <View style={{
                  flexDirection: "row", alignItems: "center",
                  backgroundColor: "#18181B05",
                  borderRadius: 10,
                  borderColor: "#C7C7CC",
                  borderWidth: 1,
                  paddingLeft: 16,
                  paddingRight: 6,
                  paddingVertical: 6,
                }}>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: "#1A1A2E",
                      maxHeight: 120,
                      paddingVertical: 4,
                    }}
                    placeholder={activeTab === "todo" ? "Add a task..." : "Ask HDA Ai..."}
                    placeholderTextColor="#B0B0C0"
                    value={input}
                    onChangeText={setInput}
                    multiline
                    onSubmitEditing={handleSend}
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={loading}
                    style={{ marginLeft: 6 }}
                    activeOpacity={0.8}
                  >
                    <AI7 width={36} height={36} />
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
});