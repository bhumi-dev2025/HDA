import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ChatBubble from "../../componunts/ChatBubble";
import { GeminiResponse, getStoredApiKey, sendMessage } from "../../lib/gemini";
import { todoEvents } from "../../lib/todoEvents";
import {
  addTasksToDailyLog,
  removeTasksFromDailyLog,
} from "../../lib/todoService";
import { getTodayLog, updateDailyLog } from "../../lib/TrackerService";

const homeBg = require("../../assets/photo/login/2.0/home.png");

const CHAT_HISTORY_KEY = "chat_history";
const MAX_HISTORY = 20;

type Message = {
  id: string;
  role: "user" | "model" | "system" | "error";
  text: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeTab, setActiveTab] = useState<"todo" | "health">("health");
  const flatListRef = useRef<FlatList>(null);
  const isAtBottom = useRef(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const onShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        150,
      );
    };
    const onHide = () => setKeyboardHeight(0);
    const showSub = Keyboard.addListener("keyboardDidShow", onShow);
    const hideSub = Keyboard.addListener("keyboardDidHide", onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    loadHistory();
  }, []);

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
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear all chat history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setMessages([]);
            await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const key = await getStoredApiKey();
        setHasKey(!!key);
      })();
    }, []),
  );

  const appendMessage = (role: Message["role"], text: string) => {
    setMessages((prev) => {
      const updated = [
        ...prev,
        { id: Date.now().toString() + Math.random(), role, text },
      ];
      saveHistory(updated);
      return updated;
    });
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Reliable refresh — save thya pachi turant emit, no delay
  const emitRefresh = () => {
    todoEvents.emit();
  };

  // Single tool call handle karo — returns confirmation message
  const executeSingleToolCall = async (
    functionName: string,
    args: Record<string, any>,
  ): Promise<string | null> => {
    // ── ADD TODO ──────────────────────────────────────────────────────────────
    if (functionName === "add_todo") {
      const newTasks: { text: string }[] = args.tasks ?? [];
      if (newTasks.length === 0)
        return "I couldn't find any tasks to add. Please mention what you want to add.";
      try {
        const result = await addTasksToDailyLog(newTasks);
        if (!result.success) return result.error ?? "Could not add tasks.";
        const addedCount = newTasks.length;
        const taskLines = newTasks.map((t) => `• ${t.text}`).join("\n");
        const remaining = result.merged.filter(
          (m: any) => m.text.trim() !== "",
        ).length;
        return `✅ ${addedCount} task${addedCount > 1 ? "s" : ""} added:\n${taskLines}\n${remaining}/3 tasks in your list.`;
      } catch {
        return "Sorry, I couldn't add the tasks. Please try again.";
      }

      // ── REMOVE TODO ───────────────────────────────────────────────────────────
    } else if (functionName === "remove_todo") {
      const tasksToRemove: { text: string }[] = args.tasks ?? [];
      const removeAll: boolean = args.removeAll ?? false;
      if (!removeAll && tasksToRemove.length === 0)
        return "Please tell me which task you want to remove.";
      try {
        const result = await removeTasksFromDailyLog(tasksToRemove, removeAll);
        if (!result.success) return "Your todo list is already empty.";
        if (result.removedCount === 0)
          return "I couldn't find that task. Please check the task name.";
        if (removeAll) return "✅ All tasks cleared from your todo list.";
        return `✅ ${result.removedCount} task${result.removedCount > 1 ? "s" : ""} removed.\n${result.remaining.length}/3 tasks remaining.`;
      } catch {
        return "Sorry, I couldn't remove the task. Please try again.";
      }

      // ── SET MEDITATION ────────────────────────────────────────────────────────
    } else if (functionName === "set_meditation") {
      const time: string = args.time ?? "10m";
      try {
        const result = await updateDailyLog("meditation", time);
        if (!result.success)
          return "Could not update meditation. Please try again.";
        return `🧘 Meditation updated to ${time}!`;
      } catch {
        return "Sorry, I couldn't update meditation. Please try again.";
      }

      // ── SET WATER ─────────────────────────────────────────────────────────────
    } else if (functionName === "set_water") {
      const liters: number = args.liters ?? 1.5;
      try {
        const result = await updateDailyLog("water", liters);
        if (!result.success)
          return "Could not update water intake. Please try again.";
        return `💧 Water intake updated to ${liters.toFixed(1)}L!`;
      } catch {
        return "Sorry, I couldn't update water intake. Please try again.";
      }

      // ── SET SLEEP ─────────────────────────────────────────────────────────────
    } else if (functionName === "set_sleep") {
      const hour: string = args.hour ?? "08";
      const minute: string = args.minute ?? "00";
      const sleepData = {
        hour: hour.toString().padStart(2, "0"),
        minute: minute.toString().padStart(2, "0"),
      };
      try {
        const result = await updateDailyLog("sleep", sleepData);
        if (!result.success) return "Could not update sleep. Please try again.";
        return `😴 Sleep updated to ${sleepData.hour}h ${sleepData.minute}m!`;
      } catch {
        return "Sorry, I couldn't update sleep. Please try again.";
      }

      // ── SET WORKOUT ───────────────────────────────────────────────────────────
    } else if (functionName === "set_workout") {
      const hour: string = args.hour ?? "00";
      const minute: string = args.minute ?? "30";
      const workoutData = {
        hour: hour.toString().padStart(2, "0"),
        minute: minute.toString().padStart(2, "0"),
      };
      try {
        const result = await updateDailyLog("workout", workoutData);
        if (!result.success)
          return "Could not update workout. Please try again.";
        return `💪 Workout updated to ${workoutData.hour}h ${workoutData.minute}m!`;
      } catch {
        return "Sorry, I couldn't update workout. Please try again.";
      }
    }
    return null;
  };

  // Single tool call
  const handleToolCall = async (
    functionName: string,
    args: Record<string, any>,
  ) => {
    const msg = await executeSingleToolCall(functionName, args);
    if (msg) appendMessage("model", msg);
    emitRefresh();
  };

  // Multiple tool calls — paragraph ma multiple health items
  const handleMultiToolCall = async (
    calls: { functionName: string; args: Record<string, any> }[],
  ) => {
    const results: string[] = [];
    for (const call of calls) {
      const msg = await executeSingleToolCall(call.functionName, call.args);
      if (msg) results.push(msg);
    }
    if (results.length > 0) {
      appendMessage("model", results.join("\n"));
    }
    emitRefresh();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!hasKey) {
      Alert.alert(
        "No API Key",
        "Please add your Gemini API key in Settings first.",
        [
          {
            text: "Go to Settings",
            onPress: () => router.push("/settings/ai"),
          },
        ],
      );
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
    };
    const currentHistory = messages
      .filter((m) => m.role === "user" || m.role === "model")
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role as "user" | "model", text: m.text }));

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      saveHistory(updated);
      return updated;
    });
    setInput("");
    setLoading(true);

    try {
      const todayLog = await getTodayLog();
      const liveTodos: { text: string; isDone: boolean }[] =
        todayLog?.todo_list ?? [];
      const liveHealth = {
        meditation: todayLog?.meditation_time,
        water: todayLog?.water_intake,
        sleep: todayLog?.sleep_data,
        workout: todayLog?.workout_time,
      };

      const response: GeminiResponse = await sendMessage(
        currentHistory,
        userMsg.text,
        activeTab,
        liveTodos,
        liveHealth,
      );

      if (response.type === "text") {
        appendMessage("model", response.text);
      } else if (response.type === "multi_tool_call") {
        await handleMultiToolCall(response.calls);
      } else if (response.type === "tool_call") {
        await handleToolCall(response.functionName, response.args);
      }
    } catch (error: any) {
      const isNoKey = error?.message === "NO_API_KEY";
      let title = "Error";
      let message = error?.message || "Unknown error occurred.";
      if (isNoKey) {
        title = "No API Key";
        message = "Please add your Gemini API key in Settings.";
      } else if (
        error?.message?.includes("API_KEY_INVALID") ||
        error?.message?.includes("invalid")
      ) {
        title = "Invalid API Key";
        message = "Your API key is invalid.";
      } else if (
        error?.message?.includes("quota") ||
        error?.message?.includes("QUOTA")
      ) {
        title = "Quota Exceeded";
        message = "Your API quota is exceeded. Try again later.";
      }
      Alert.alert(title, message, [
        {
          text: isNoKey ? "Go to Settings" : "OK",
          onPress: isNoKey ? () => router.push("/settings/ai") : undefined,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const NoKeyBanner = () =>
    hasKey === false ? (
      <TouchableOpacity
        onPress={() => router.push("/settings/ai")}
        style={{
          margin: 16,
          marginTop: 12,
          backgroundColor: "rgba(251,191,36,0.1)",
          borderWidth: 1,
          borderColor: "rgba(251,191,36,0.3)",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons name="warning-outline" size={18} color="#fbbf24" />
        <Text
          style={{ color: "#fbbf24", fontSize: 13, marginLeft: 8, flex: 1 }}
        >
          No API key found. Tap to add your Gemini key in Settings.
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#fbbf24" />
      </TouchableOpacity>
    ) : null;

  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: 16 }}>✨</Text>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#FFFFFF",
          marginBottom: 8,
        }}
      >
        Health Assistant
      </Text>
      <Text
        style={{
          color: "#636366",
          textAlign: "center",
          fontSize: 14,
          lineHeight: 24,
        }}
      >
        Track your daily health by chatting!{"\n\n"}
        🧘 "Meditated for 20 mins"{"\n"}
        💧 "Drank 2 liters of water"{"\n"}
        😴 "Slept for 8 hours"{"\n"}
        💪 "Gym karyu 45 min"{"\n"}✅ "Add buy groceries to todo"
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView
            style={{
              flex: 1,
              paddingBottom: Platform.OS === "android" ? keyboardHeight : 0,
            }}
            edges={["top", "left", "right"]}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.07)",
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}
              >
                Health Assistant
              </Text>
              {messages.length > 0 && (
                <TouchableOpacity onPress={clearHistory} style={{ padding: 8 }}>
                  <Ionicons name="trash-outline" size={20} color="#636366" />
                </TouchableOpacity>
              )}
            </View>

            <NoKeyBanner />

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatBubble role={item.role} text={item.text} />
              )}
              contentContainerStyle={
                messages.length === 0 ? { flex: 1 } : { paddingVertical: 12 }
              }
              ListEmptyComponent={<EmptyState />}
              onContentSizeChange={() => {
                if (isAtBottom.current)
                  flatListRef.current?.scrollToEnd({ animated: true });
              }}
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } =
                  nativeEvent;
                isAtBottom.current =
                  layoutMeasurement.height + contentOffset.y >=
                  contentSize.height - 40;
              }}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
            />

            {loading && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingBottom: 8,
                  alignSelf: "flex-start",
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="small" color="#636366" />
                  <Text
                    style={{ color: "#636366", fontSize: 14, marginLeft: 8 }}
                  >
                    Thinking…
                  </Text>
                </View>
              </View>
            )}

            {/* Input bar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                paddingHorizontal: 12,
                paddingVertical: 12,
                paddingBottom:
                  Platform.OS === "android" ? 12 : 60 + insets.bottom + 12,
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.07)",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: "#FFFFFF",
                  fontSize: 15,
                  maxHeight: 128,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
                placeholder="Meditation, water, sleep, workout, todos..."
                placeholderTextColor="#636366"
                value={input}
                onChangeText={setInput}
                multiline
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  marginLeft: 8,
                  marginBottom: 2,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    input.trim() && !loading
                      ? "#0A84FF"
                      : "rgba(255,255,255,0.1)",
                }}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={input.trim() && !loading ? "white" : "#636366"}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
