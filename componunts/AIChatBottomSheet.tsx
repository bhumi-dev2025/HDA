import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GeminiResponse, getStoredApiKey, sendMessage } from "../lib/gemini";
import { chatEvents } from "../lib/chatEvents";
import { todoEvents } from "../lib/todoEvents";
import { addTasksToDailyLog, removeTasksFromDailyLog } from "../lib/todoService";
import { getTodayLog, updateDailyLog } from "../lib/TrackerService";
import ChatBubble from "./ChatBubble";
import SegmentedControl from "./segmented-control";
import { AppBottomSheet } from "./Modals/modals2.0/AppBottomSheet";

// SVG Assets
import A1 from "../assets/2.0/chatmodel/A1.svg";
import A2 from "../assets/2.0/chatmodel/A2.svg";
import S1 from "../assets/2.0/chatmodel/S1.svg";

const FramePng = require("../assets/2.0/chatmodel/Frame.png");

export type AIChatBottomSheetHandle = { open: () => void };

const CHAT_HISTORY_KEY    = "ai_chat_history_v2";
const ACADEMY_HISTORY_KEY = "ai_academy_history_v2";
const MAX_HISTORY = 20;

type Message = {
  id: string;
  role: "user" | "model" | "system" | "error";
  text: string;
};

type ActiveTab = "anything" | "academy";

const ACADEMY_SUGGESTIONS = [
  "How long is the cohort?",
  "What are the timings?",
  "What I'm going to learn?",
  "What's from HDA?",
  "Who are the mentors?",
  "What skills will I get?",
];

export default forwardRef<AIChatBottomSheetHandle>(function AIChatBottomSheet(_, ref) {
  const [isOpen, setIsOpen]       = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("anything");
  const [anythingMessages, setAnythingMessages] = useState<Message[]>([]);
  const [academyMessages, setAcademyMessages]   = useState<Message[]>([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isAtBottom  = useRef(true);
  const router  = useRouter();

  const messages = activeTab === "anything" ? anythingMessages : academyMessages;

  useImperativeHandle(ref, () => ({ open: () => setIsOpen(true) }));

  useEffect(() => {
    const unsub = chatEvents.subscribe(() => setIsOpen(true));
    return unsub;
  }, []);

  useEffect(() => { loadHistories(); }, []);

  const loadHistories = async () => {
    try {
      const a = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      const b = await AsyncStorage.getItem(ACADEMY_HISTORY_KEY);
      if (a) setAnythingMessages(JSON.parse(a));
      if (b) setAcademyMessages(JSON.parse(b));
    } catch {}
  };

  const saveHistory = async (msgs: Message[], tab: ActiveTab) => {
    const key = tab === "anything" ? CHAT_HISTORY_KEY : ACADEMY_HISTORY_KEY;
    try { await AsyncStorage.setItem(key, JSON.stringify(msgs)); } catch {}
  };

  useEffect(() => {
    (async () => {
      const key = await getStoredApiKey();
      setHasKey(!!key);
    })();
  }, [isOpen]);

  const appendMessage = (role: Message["role"], text: string, tab: ActiveTab) => {
    const setter = tab === "anything" ? setAnythingMessages : setAcademyMessages;
    setter((prev) => {
      const updated = [...prev, { id: Date.now().toString() + Math.random(), role, text }];
      saveHistory(updated, tab);
      return updated;
    });
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const emitRefresh = () => todoEvents.emit();

  const handleToolCall = async (functionName: string, args: Record<string, any>) => {
    const tab = "anything";
    if (functionName === "add_todo") {
      const tasks: { text: string }[] = args.tasks ?? [];
      if (!tasks.length) { appendMessage("model", "No tasks found.", tab); return; }
      try {
        const r = await addTasksToDailyLog(tasks);
        if (!r.success) { appendMessage("model", r.error ?? "Could not add tasks.", tab); return; }
        appendMessage("model", `✅ ${tasks.length} task${tasks.length > 1 ? "s" : ""} added:\n${tasks.map(t => `• ${t.text}`).join("\n")}`, tab);
        if (r.error) appendMessage("error", r.error, tab);
        emitRefresh();
      } catch { appendMessage("model", "Sorry, couldn't add tasks.", tab); }
    } else if (functionName === "remove_todo") {
      try {
        const r = await removeTasksFromDailyLog(args.tasks ?? [], args.removeAll ?? false);
        if (!r.success) { appendMessage("model", "Todo list is already empty.", tab); return; }
        appendMessage("model", args.removeAll ? "✅ All tasks cleared." : `✅ ${r.removedCount} task${r.removedCount > 1 ? "s" : ""} removed.`, tab);
        emitRefresh();
      } catch { appendMessage("model", "Sorry, couldn't remove task.", tab); }
    } else if (functionName === "set_meditation") {
      try {
        const r = await updateDailyLog("meditation", args.time ?? "10m");
        if (!r.success) { appendMessage("model", "Could not update meditation.", tab); return; }
        appendMessage("model", `🧘 Meditation → ${args.time}!`, tab); emitRefresh();
      } catch { appendMessage("model", "Couldn't update meditation.", tab); }
    } else if (functionName === "set_water") {
      try {
        const r = await updateDailyLog("water", args.liters ?? 1.5);
        if (!r.success) { appendMessage("model", "Could not update water.", tab); return; }
        appendMessage("model", `💧 Water → ${args.liters}L!`, tab); emitRefresh();
      } catch { appendMessage("model", "Couldn't update water.", tab); }
    } else if (functionName === "set_sleep") {
      const d = { hour: (args.hour ?? "08").padStart(2, "0"), minute: (args.minute ?? "00").padStart(2, "0") };
      try {
        const r = await updateDailyLog("sleep", d);
        if (!r.success) { appendMessage("model", "Could not update sleep.", tab); return; }
        appendMessage("model", `😴 Sleep → ${d.hour}h ${d.minute}m!`, tab); emitRefresh();
      } catch { appendMessage("model", "Couldn't update sleep.", tab); }
    } else if (functionName === "set_workout") {
      const d = { hour: (args.hour ?? "00").padStart(2, "0"), minute: (args.minute ?? "30").padStart(2, "0") };
      try {
        const r = await updateDailyLog("workout", d);
        if (!r.success) { appendMessage("model", "Could not update workout.", tab); return; }
        appendMessage("model", `💪 Workout → ${d.hour}h ${d.minute}m!`, tab); emitRefresh();
      } catch { appendMessage("model", "Couldn't update workout.", tab); }
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || loading) return;
    if (!hasKey) {
      Alert.alert("No API Key", "Add your Gemini key in Settings.",
        [{ text: "Go to Settings", onPress: () => { setIsOpen(false); router.push("/settings/ai"); } }]);
      return;
    }
    const currentMsgs = activeTab === "anything" ? anythingMessages : academyMessages;
    const history = currentMsgs
      .filter(m => m.role === "user" || m.role === "model")
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role as "user" | "model", text: m.text }));
    appendMessage("user", text, activeTab);
    setInput("");
    setLoading(true);
    try {
      const todayLog   = await getTodayLog();
      const liveTodos  = todayLog?.todo_list ?? [];
      const liveHealth = { meditation: todayLog?.meditation_time, water: todayLog?.water_intake, sleep: todayLog?.sleep_data, workout: todayLog?.workout_time };
      const response: GeminiResponse = await sendMessage(history, text, "health", liveTodos, liveHealth);
      if (response.type === "text") appendMessage("model", response.text, activeTab);
      else if (response.type === "tool_call") await handleToolCall(response.functionName, response.args);
      else if (response.type === "multi_tool_call") {
        for (const call of response.calls) await handleToolCall(call.functionName, call.args);
      }
    } catch (error: any) {
      const isNoKey = error?.message === "NO_API_KEY";
      Alert.alert(isNoKey ? "No API Key" : "Error",
        isNoKey ? "Add your Gemini key in Settings." : error?.message || "Unknown error.",
        [{ text: isNoKey ? "Go to Settings" : "OK", onPress: isNoKey ? () => { setIsOpen(false); router.push("/settings/ai"); } : undefined }]);
    } finally { setLoading(false); }
  };

  const clearHistory = () => {
    Alert.alert("Clear Chat", "Clear this chat?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        if (activeTab === "anything") { setAnythingMessages([]); await AsyncStorage.removeItem(CHAT_HISTORY_KEY); }
        else { setAcademyMessages([]); await AsyncStorage.removeItem(ACADEMY_HISTORY_KEY); }
      }},
    ]);
  };

  // ── Empty States ─────────────────────────────────────────────
  const AnythingEmpty = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-neutral-500 text-sm text-center leading-5">
        Ask me anything about your health, tasks, or daily routine.
      </Text>
    </View>
  );

  const AcademyEmpty = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Image source={FramePng} style={{ width: 64, height: 64, marginBottom: 16 }} resizeMode="contain" />
      <Text className="text-neutral-400 text-sm text-center leading-5 mb-5">
        Try typing something like or ask anything{"\n"}about HDA.
      </Text>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {ACADEMY_SUGGESTIONS.map((s) => (
          <Pressable
            key={s} onPress={() => handleSend(s)}
            className="rounded-xl px-3 py-2 border"
            style={{ backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" }}
          >
            <Text className="text-neutral-400 text-xs leading-4">{s}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  // ── No Key Banner ─────────────────────────────────────────────
  const NoKeyBanner = () => hasKey === false ? (
    <TouchableOpacity
      onPress={() => { setIsOpen(false); router.push("/settings/ai"); }}
      className="mb-3 rounded-xl px-4 py-3 flex-row items-center border"
      style={{ backgroundColor: "#2C2400", borderColor: "#FFD54F" }}
    >
      <Ionicons name="warning-outline" size={16} color="#F59E0B" />
      <Text className="text-yellow-400 text-xs ml-2 flex-1">
        No API key found. Tap to add your Gemini key in Settings.
      </Text>
      <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
    </TouchableOpacity>
  ) : null;

  // ── Render ────────────────────────────────────────────────────
  return (
    <AppBottomSheet
      isVisible={isOpen}
      onClose={() => setIsOpen(false)}
      snapPoints={["88%"]}
      enableDynamicSizing={false}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row justify-end px-1 pt-1 pb-1">
          <TouchableOpacity onPress={clearHistory} className="p-2">
            <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2">
            <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
        </View>

        {/* ── Segmented Control — exact reference style ── */}
        <View className="px-1 py-2">
          <SegmentedControl
            value={activeTab}
            onValueChange={(v) => { setActiveTab(v as ActiveTab); setInput(""); }}
            className="p-1 justify-between rounded-full border"
            style={[styles.segBg, styles.borderCurve]}
          >
            <SegmentedControl.Indicator
              className="top-[4px] -ml-px rounded-full border"
              style={[styles.indicatorBg, styles.borderCurve]}
            />
            <SegmentedControl.Item
              value="anything"
              className="flex-1 items-center justify-center gap-1 py-3 flex-row"
            >
              <A2 width={16} height={16} />
              <Text className={activeTab === "anything" ? "text-xs text-white font-medium" : "text-xs text-neutral-500"}>
                Ask anything
              </Text>
            </SegmentedControl.Item>
            <SegmentedControl.Item
              value="academy"
              className="flex-1 items-center justify-center gap-1 py-3 flex-row"
            >
              <A1 width={16} height={16} />
              <Text className={activeTab === "academy" ? "text-xs text-white font-medium" : "text-xs text-neutral-500"}>
                Ask academy
              </Text>
            </SegmentedControl.Item>
          </SegmentedControl>
        </View>

        <NoKeyBanner />

        {/* Chat List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble role={item.role} text={item.text} />}
          contentContainerStyle={messages.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
          ListEmptyComponent={
            messages.length === 0
              ? (activeTab === "academy" ? <AcademyEmpty /> : <AnythingEmpty />)
              : null
          }
          onContentSizeChange={() => {
            if (isAtBottom.current) flatListRef.current?.scrollToEnd({ animated: true });
          }}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            isAtBottom.current = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
          }}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
        />

        {/* Loading */}
        {loading && (
          <View className="px-1 pb-2">
            <View className="flex-row items-center rounded-2xl px-4 py-3 self-start"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.45)" />
              <Text className="text-neutral-400 text-sm ml-2">Thinking…</Text>
            </View>
          </View>
        )}

        {/* Input Bar */}
        <View className="pt-2 pb-3">
          <View
            className="flex-row items-center rounded-full px-4 border"
            style={{ backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.10)" }}
          >
            <TextInput
              className="flex-1 text-sm text-white py-3"
              placeholder="Ask for anything..."
              placeholderTextColor="rgba(255,255,255,0.22)"
              value={input}
              onChangeText={setInput}
              multiline
              style={{ maxHeight: 100 }}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={loading || !input.trim()}
              style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.35 }]}
              activeOpacity={0.8}
            >
              <S1 width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  borderCurve: {
    // iOS 16+ smooth corners — same as reference tab-control.tsx
    borderCurve: "continuous",
  } as any,
  segBg: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.10)",
  },
  indicatorBg: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.18)",
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
