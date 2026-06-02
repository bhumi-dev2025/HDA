import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ImageBackground,
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
import AI1 from "../assets/photo/home/AI1.svg";
import AI4 from "../assets/photo/home/AI4.svg";
import AI5 from "../assets/photo/home/AI5.svg";
import AI7 from "../assets/photo/home/AI7.svg";
import { chatEvents } from "../lib/chatEvents";
import { GeminiResponse, getStoredApiKey, sendMessage } from "../lib/gemini";
import { todoEvents } from "../lib/todoEvents";
import {
  addTasksToDailyLog,
  removeTasksFromDailyLog,
} from "../lib/todoService";
import { getTodayLog, updateDailyLog } from "../lib/TrackerService";
import ChatBubble from "./ChatBubble";

export type FloatingChatButtonHandle = { open: () => void };

const CHAT_HISTORY_KEY = "chat_history";
const MAX_HISTORY = 20;
const modalBg = require("../assets/2.0/model/bg.png");

type Message = {
  id: string;
  role: "user" | "model" | "system" | "error";
  text: string;
};
type ActiveTab = "todo" | "health";

// ── Dark theme tokens ──────────────────────────────────────────────────────
const D = {
  bg: "#111111",
  border: "rgba(255,255,255,0.08)",
  borderActive: "rgba(255,255,255,0.22)",
  handle: "rgba(255,255,255,0.2)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.45)",
  textMuted: "rgba(255,255,255,0.22)",
  tabActiveBg: "rgba(255,255,255,0.12)",
  tabActiveBorder: "rgba(255,255,255,0.25)",
  inputBg: "rgba(255,255,255,0.07)",
  loadingBg: "rgba(255,255,255,0.08)",
  iconColor: "rgba(255,255,255,0.35)",
  divider: "rgba(255,255,255,0.07)",
  emptyItemBorder: "rgba(255,255,255,0.07)",
  sendBtn: "#FFFFFF",
  backdrop: "rgba(0,0,0,0.65)",
};

export default forwardRef<FloatingChatButtonHandle>(
  function FloatingChatButton(_, ref) {
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

    useImperativeHandle(ref, () => ({ open: () => setIsOpen(true) }));

    useEffect(() => {
      const unsub = chatEvents.subscribe(() => setIsOpen(true));
      return unsub;
    }, []);

    useEffect(() => {
      const showEv =
        Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
      const hideEv =
        Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
      const onShow = (e: any) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          150,
        );
      };
      const onHide = () => setKeyboardHeight(0);
      const s1 = Keyboard.addListener(showEv, onShow);
      const s2 = Keyboard.addListener(hideEv, onHide);
      return () => {
        s1.remove();
        s2.remove();
      };
    }, []);

    useEffect(() => {
      loadHistory();
    }, []);

    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
        if (saved) setMessages(JSON.parse(saved));
      } catch {}
    };

    const saveHistory = async (msgs: Message[]) => {
      try {
        await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs));
      } catch {}
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

    useEffect(() => {
      (async () => {
        const key = await getStoredApiKey();
        setHasKey(!!key);
      })();
    }, [isOpen]);

    const appendMessage = (role: Message["role"], text: string) => {
      setMessages((prev) => {
        const updated = [
          ...prev,
          { id: Date.now().toString() + Math.random(), role, text },
        ];
        saveHistory(updated);
        return updated;
      });
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    };

    const emitRefresh = () => {
      todoEvents.emit();
      setTimeout(() => todoEvents.emit(), 2000);
    };

    const handleToolCall = async (
      functionName: string,
      args: Record<string, any>,
    ) => {
      if (functionName === "add_todo") {
        const newTasks: { text: string }[] = args.tasks ?? [];
        if (!newTasks.length) {
          appendMessage("model", "I couldn't find any tasks to add.");
          return;
        }
        try {
          const result = await addTasksToDailyLog(newTasks);
          if (!result.success) {
            appendMessage("model", result.error ?? "Could not add tasks.");
            return;
          }
          const taskLines = newTasks.map((t) => `• ${t.text}`).join("\n");
          const remaining = result.merged.filter(
            (m) => m.text.trim() !== "",
          ).length;
          appendMessage(
            "model",
            `✅ ${newTasks.length} task${newTasks.length > 1 ? "s" : ""} added:\n${taskLines}\n${remaining}/3 tasks in your list.`,
          );
          if (result.error) appendMessage("error", result.error);
          emitRefresh();
        } catch {
          appendMessage(
            "model",
            "Sorry, I couldn't add the tasks. Please try again.",
          );
        }
      } else if (functionName === "remove_todo") {
        const tasksToRemove: { text: string }[] = args.tasks ?? [];
        const removeAll: boolean = args.removeAll ?? false;
        if (!removeAll && !tasksToRemove.length) {
          appendMessage(
            "model",
            "Please tell me which task you want to remove.",
          );
          return;
        }
        try {
          const result = await removeTasksFromDailyLog(
            tasksToRemove,
            removeAll,
          );
          if (!result.success) {
            appendMessage("model", "Your todo list is already empty.");
            return;
          }
          if (!result.removedCount) {
            appendMessage("model", "I couldn't find that task.");
            return;
          }
          if (removeAll) appendMessage("model", "✅ All tasks cleared.");
          else
            appendMessage(
              "model",
              `✅ ${result.removedCount} task${result.removedCount > 1 ? "s" : ""} removed.\n${result.remaining.length}/3 tasks remaining.`,
            );
          emitRefresh();
        } catch {
          appendMessage("model", "Sorry, I couldn't remove the task.");
        }
      } else if (functionName === "set_meditation") {
        try {
          const result = await updateDailyLog("meditation", args.time ?? "10m");
          if (!result.success) {
            appendMessage("model", "Could not update meditation.");
            return;
          }
          appendMessage("model", `🧘 Meditation updated to ${args.time}!`);
          emitRefresh();
        } catch {
          appendMessage("model", "Couldn't update meditation.");
        }
      } else if (functionName === "set_water") {
        try {
          const result = await updateDailyLog("water", args.liters ?? 1.5);
          if (!result.success) {
            appendMessage("model", "Could not update water intake.");
            return;
          }
          appendMessage(
            "model",
            `💧 Water intake updated to ${(args.liters ?? 1.5).toFixed(1)}L!`,
          );
          emitRefresh();
        } catch {
          appendMessage("model", "Couldn't update water intake.");
        }
      } else if (functionName === "set_sleep") {
        const d = {
          hour: (args.hour ?? "08").toString().padStart(2, "0"),
          minute: (args.minute ?? "00").toString().padStart(2, "0"),
        };
        try {
          const result = await updateDailyLog("sleep", d);
          if (!result.success) {
            appendMessage("model", "Could not update sleep.");
            return;
          }
          appendMessage(
            "model",
            `😴 Sleep updated to ${d.hour}h ${d.minute}m!`,
          );
          emitRefresh();
        } catch {
          appendMessage("model", "Couldn't update sleep.");
        }
      } else if (functionName === "set_workout") {
        const d = {
          hour: (args.hour ?? "00").toString().padStart(2, "0"),
          minute: (args.minute ?? "30").toString().padStart(2, "0"),
        };
        try {
          const result = await updateDailyLog("workout", d);
          if (!result.success) {
            appendMessage("model", "Could not update workout.");
            return;
          }
          appendMessage(
            "model",
            `💪 Workout updated to ${d.hour}h ${d.minute}m!`,
          );
          emitRefresh();
        } catch {
          appendMessage("model", "Couldn't update workout.");
        }
      }
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
              onPress: () => {
                setIsOpen(false);
                router.push("/settings/ai");
              },
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
        if (response.type === "text") appendMessage("model", response.text);
        else if (response.type === "tool_call")
          await handleToolCall(response.functionName, response.args);
        else if (response.type === "multi_tool_call") {
          for (const call of response.calls)
            await handleToolCall(call.functionName, call.args);
        }
      } catch (error: any) {
        const isNoKey = error?.message === "NO_API_KEY";
        Alert.alert(
          isNoKey ? "No API Key" : "Error",
          isNoKey
            ? "Please add your Gemini API key in Settings."
            : error?.message || "Unknown error.",
          [
            {
              text: isNoKey ? "Go to Settings" : "OK",
              onPress: isNoKey
                ? () => {
                    setIsOpen(false);
                    router.push("/settings/ai");
                  }
                : undefined,
            },
          ],
        );
      } finally {
        setLoading(false);
      }
    };

    const NoKeyBanner = () =>
      hasKey === false ? (
        <TouchableOpacity
          onPress={() => {
            setIsOpen(false);
            router.push("/settings/ai");
          }}
          style={{
            marginHorizontal: 16,
            marginTop: 10,
            backgroundColor: "rgba(44,36,0,0.9)",
            borderWidth: 1,
            borderColor: "#FFD54F",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="warning-outline" size={16} color="#F59E0B" />
          <Text
            style={{ color: "#fbbf24", fontSize: 12, marginLeft: 8, flex: 1 }}
          >
            No API key found. Tap to add your Gemini key in Settings.
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
        </TouchableOpacity>
      ) : null;

    const EmptyState = () => (
      <View
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}
      >
        {(activeTab === "todo"
          ? [
              "Buy groceries",
              "Call client tomorrow",
              "Finish project report",
              "Remove gym task",
            ]
          : [
              "8.5 Hours Sleep",
              "10 Min Meditation",
              "Drank 2 liters water",
              "Gym workout 45 Min",
            ]
        ).map((item, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 13,
              borderBottomWidth: 0.5,
              borderBottomColor: D.emptyItemBorder,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: D.textSecondary,
                fontWeight: "400",
              }}
            >
              {item}
            </Text>
            <Ionicons
              name="arrow-up-outline"
              size={14}
              color={D.textMuted}
              style={{ transform: [{ rotate: "45deg" }] }}
            />
          </View>
        ))}
      </View>
    );

    return (
      <>
        <Modal
          visible={isOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsOpen(false)}
        >
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            {/* Blur backdrop — AppBottomSheet jevo j */}
            <TouchableOpacity
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              activeOpacity={1}
              onPress={() => setIsOpen(false)}
            >
              {Platform.OS === "ios" ? (
                <BlurView
                  intensity={28}
                  tint="dark"
                  style={{ flex: 1 }}
                />
              ) : (
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }} />
              )}
            </TouchableOpacity>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={0}
            >
              <ImageBackground
                source={modalBg}
                resizeMode="cover"
                style={{
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  overflow: "hidden",
                  height:
                    Platform.OS === "ios"
                      ? keyboardHeight > 0
                        ? 720 - keyboardHeight
                        : 600
                      : keyboardHeight > 0
                        ? 420
                        : 620,
                  marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
                  display: "flex",
                  flexDirection: "column",
                }}
                imageStyle={{
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                }}
              >
                {/* Drag Handle */}
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                    paddingBottom: 4,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: D.handle,
                    }}
                  />
                </View>

                {/* Header — empty state */}
                {messages.length === 0 && (
                  <View
                    style={{
                      alignItems: "center",
                      paddingTop: 16,
                      paddingBottom: 12,
                      borderBottomWidth: 0.5,
                      borderBottomColor: D.divider,
                    }}
                  >
                    <View style={{ position: "absolute", right: 0, top: 12 }}>
                      <TouchableOpacity
                        onPress={() => setIsOpen(false)}
                        style={{ padding: 8 }}
                      >
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color={D.iconColor}
                        />
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        marginBottom: 10,
                        borderRadius: 10,
                        overflow: "hidden",
                        width: 52,
                        height: 52,
                      }}
                    >
                      <AI1 width={52} height={52} />
                    </View>
                    <MaskedView
                      maskElement={
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "700",
                            marginBottom: 4,
                            letterSpacing: 0.2,
                          }}
                        >
                          Health Assistant
                        </Text>
                      }
                    >
                      <LinearGradient
                        colors={["#6015C0", "#247FFB"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "700",
                            marginBottom: 4,
                            letterSpacing: 0.2,
                            opacity: 0,
                          }}
                        >
                          Health Assistant
                        </Text>
                      </LinearGradient>
                    </MaskedView>
                    <Text style={{ fontSize: 12, color: D.textSecondary }}>
                      Track your daily health by chatting!
                    </Text>
                  </View>
                )}

                {/* Header — with messages */}
                {messages.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: 10,
                      borderBottomWidth: 0.5,
                      borderBottomColor: D.divider,
                      paddingLeft: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          borderRadius: 8,
                          overflow: "hidden",
                          width: 32,
                          height: 32,
                        }}
                      >
                        <AI1 width={32} height={32} />
                      </View>
                      <Text
                        style={{
                          color: D.textPrimary,
                          fontSize: 15,
                          fontWeight: "600",
                        }}
                      >
                        Health Assistant
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <TouchableOpacity
                        onPress={clearHistory}
                        style={{ padding: 8 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={D.iconColor}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsOpen(false)}
                        style={{ padding: 8 }}
                      >
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color={D.iconColor}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <NoKeyBanner />
                {/* Messages */}
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <ChatBubble role={item.role} text={item.text} />
                  )}
                  contentContainerStyle={
                    messages.length === 0
                      ? { flex: 1 }
                      : { paddingVertical: 12 }
                  }
                  ListEmptyComponent={
                    messages.length === 0 ? <EmptyState /> : null
                  }
                  onContentSizeChange={() => {
                    if (isAtBottom.current)
                      flatListRef.current?.scrollToEnd({ animated: true });
                  }}
                  onScroll={(e) => {
                    const { layoutMeasurement, contentOffset, contentSize } =
                      e.nativeEvent;
                    isAtBottom.current =
                      layoutMeasurement.height + contentOffset.y >=
                      contentSize.height - 40;
                  }}
                  scrollEventThrottle={16}
                  keyboardShouldPersistTaps="handled"
                  style={{
                    flex: 1,
                    maxHeight:
                      Platform.OS === "android" && keyboardHeight > 0
                        ? 420 - 160
                        : undefined,
                  }}
                />

                {/* Loading */}
                {loading && (
                  <View style={{ paddingVertical: 8 }}>
                    <View
                      style={{
                        backgroundColor: D.loadingBg,
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "flex-start",
                      }}
                    >
                      <ActivityIndicator size="small" color={D.textSecondary} />
                      <Text
                        style={{
                          color: D.textSecondary,
                          fontSize: 13,
                          marginLeft: 8,
                        }}
                      >
                        Thinking…
                      </Text>
                    </View>
                  </View>
                )}

                {/* Bottom — Tabs + Input */}
                <View
                  style={{
                    borderTopWidth: 0.5,
                    borderTopColor: D.divider,
                    paddingTop: 10,
                    paddingHorizontal: 14,
                    paddingBottom:
                      Platform.OS === "android"
                        ? keyboardHeight > 0
                          ? 12
                          : 24
                        : 8,
                    backgroundColor: "transparent",
                  }}
                >
                  {/* Tabs */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setActiveTab("todo")}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: 10,
                        marginRight: 8,
                        backgroundColor:
                          activeTab === "todo" ? D.tabActiveBg : "transparent",
                        borderWidth: activeTab === "todo" ? 1.5 : 0,
                        borderColor:
                          activeTab === "todo"
                            ? D.tabActiveBorder
                            : "transparent",
                      }}
                    >
                      <AI5
                        width={18}
                        height={18}
                        color={
                          activeTab === "todo" ? D.textPrimary : D.textSecondary
                        }
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            activeTab === "todo"
                              ? D.textPrimary
                              : D.textSecondary,
                        }}
                      >
                        Todo
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setActiveTab("health")}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: 10,
                        backgroundColor:
                          activeTab === "health"
                            ? D.tabActiveBg
                            : "transparent",
                        borderWidth: activeTab === "health" ? 1.5 : 0,
                        borderColor:
                          activeTab === "health"
                            ? D.tabActiveBorder
                            : "transparent",
                      }}
                    >
                      <AI4
                        width={18}
                        height={18}
                        color={
                          activeTab === "health"
                            ? D.textPrimary
                            : D.textSecondary
                        }
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            activeTab === "health"
                              ? D.textPrimary
                              : D.textSecondary,
                        }}
                      >
                        Health
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Input */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: D.inputBg,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: D.border,
                      paddingLeft: 16,
                      paddingRight: 6,
                      paddingVertical: 6,
                      marginBottom: 20,
                    }}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: D.textPrimary,
                        maxHeight: 120,
                        paddingVertical: 4,
                      }}
                      placeholder={
                        activeTab === "todo" ? "Add a task..." : "Ask HDA Ai..."
                      }
                      placeholderTextColor={D.textMuted}
                      value={input}
                      onChangeText={setInput}
                      multiline
                      onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity
                      onPress={handleSend}
                      disabled={loading || !input.trim()}
                      activeOpacity={0.8}
                      style={[
                        {
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: 8,
                        },
                        (!input.trim() || loading) && { opacity: 0.35 },
                      ]}
                    >
                      <AI7 width={36} height={36} />
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </>
    );
  },
);
