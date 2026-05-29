import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBottomSheet } from "../componunts/Modals/modals2.0/AppBottomSheet";
import { getTodayLog, updateDailyLog } from "../lib/TrackerService";
import { todoEvents } from "../lib/todoEvents";

import M4 from "../assets/2.0/model/M4.svg";
import C1 from "../assets/photo/home/C1.svg";
import C2 from "../assets/photo/home/C2.svg";

const homeBg = require("../assets/photo/login/2.0/home.png");
const btnBg  = require("../assets/2.0/model/button.png");

type Task = { text: string; isDone: boolean; time?: string };

const fmtTime = () => {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
};

export default function TodoPage() {
  const router = useRouter();

  const [tasks, setTasks]         = useState<Task[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editIdx, setEditIdx]     = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const data = await getTodayLog();
      if (data?.todo_list && data.todo_list.length > 0) {
        setTasks(data.todo_list);
      }
    })();
  }, []);

  const saveTasks = async (updated: Task[]) => {
    setTasks(updated);
    await updateDailyLog("todo", updated);
    todoEvents.emit();
  };

  const toggleTask = async (i: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = tasks.map((t, idx) =>
      idx === i ? { ...t, isDone: !t.isDone } : t,
    );
    await saveTasks(updated);
  };

  const openAdd = () => {
    // Max 3 tasks j add thay — juna model jevi j condition
    if (tasks.filter((t) => t.text.trim() !== "").length >= 3) return;
    setEditIdx(null);
    setInputText("");
    setSheetOpen(true);
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  const openEdit = (i: number) => {
    setEditIdx(i);
    setInputText(tasks[i].text);
    setSheetOpen(true);
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  const handleSave = async () => {
    if (!inputText.trim()) return;
    let updated: Task[];
    if (editIdx !== null) {
      updated = tasks.map((t, i) =>
        i === editIdx ? { ...t, text: inputText.trim() } : t,
      );
    } else {
      updated = [
        ...tasks,
        { text: inputText.trim(), isDone: false, time: fmtTime() },
      ];
    }
    await saveTasks(updated);
    setSheetOpen(false);
    setInputText("");
    setEditIdx(null);
  };

  const isEditing = editIdx !== null;
  const hasData   = tasks.filter((t) => t.text.trim() !== "").length > 0;

  return (
    <ImageBackground source={homeBg} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={s.safe}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Todo lists</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Empty state */}
        {!hasData ? (
          <View style={s.emptyWrap}>
            <M4 width={120} height={120} />
            <Text style={s.emptyTitle}>No todo list yet</Text>
            <Text style={s.emptyDesc}>
              Add your first todo list to stay organised and track{"\n"}your tasks with ease.
            </Text>
          </View>
        ) : (
          <FlatList
            data={tasks
              .map((t, originalIndex) => ({ ...t, originalIndex }))
              .filter((t) => t.text.trim() !== "")}
            keyExtractor={(item) => String(item.originalIndex)}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => openEdit(item.originalIndex)}
                activeOpacity={0.85}
                style={s.taskCard}
              >
                <TouchableOpacity onPress={() => toggleTask(item.originalIndex)} style={s.checkbox}>
                  {item.isDone ? <C2 width={22} height={22} /> : <C1 width={22} height={22} />}
                </TouchableOpacity>
                <View style={s.taskInfo}>
                  <Text style={[s.taskText, item.isDone && s.taskDone]} numberOfLines={2}>
                    {item.text}
                  </Text>
                  {item.time && (
                    <View style={s.timeRow}>
                      <Text style={s.timeLabel}>I'll finish this by</Text>
                      <View style={s.timeBadge}>
                        <Text style={s.timeTxt}>🕐 {item.time}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* FAB or Bottom Button */}
        {hasData ? (
          <TouchableOpacity onPress={openAdd} style={s.fab}>
            <Text style={s.fabTxt}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.bottomBtn}>
            <TouchableOpacity onPress={openAdd} activeOpacity={0.85}>
              <ImageBackground source={btnBg} style={s.btn} imageStyle={{ borderRadius: 18 }} resizeMode="cover">
                <Text style={s.btnTxt}>Add Task</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>

      {/* ── Bottom Sheet — keyboard AppBottomSheet thi handle thay ── */}
      <AppBottomSheet 
        isVisible={sheetOpen} 
        onClose={() => setSheetOpen(false)}
        snapPoints={["60%"]}
        enableDynamicSizing={false}
      >
        <View style={s.sheetContent}>
          <BottomSheetTextInput
            ref={inputRef}
            value={inputText}
            onChangeText={setInputText}
            placeholder="e.g., design for HDA mobile app at 2pm"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={s.sheetInput}
            multiline
          />
          <View style={s.sheetDivider} />
          <Text style={s.sheetDescPlaceholder}>Description</Text>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={s.btnWrap}>
            <ImageBackground source={btnBg} style={s.btn} imageStyle={{ borderRadius: 18 }} resizeMode="cover">
              <Text style={s.btnTxt}>{isEditing ? "Update task" : "Add Task"}</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>

    </ImageBackground>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  backArrow:    { color: "#FFF", fontSize: 28, lineHeight: 32, marginTop: -2 },
  headerTitle:  { color: "#FFF", fontSize: 18, fontWeight: "700" },

  emptyWrap:    { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle:   { color: "#FFF", fontSize: 18, fontWeight: "700" },
  emptyDesc:    { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", lineHeight: 20 },

  listContent:  { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100, gap: 12 },
  taskCard:     { flexDirection: "row", alignItems: "flex-start", gap: 14, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.12)" },
  checkbox:     { marginTop: 2 },
  taskInfo:     { flex: 1, gap: 6 },
  taskText:     { color: "#FFF", fontSize: 15, fontWeight: "600", lineHeight: 22 },
  taskDone:     { color: "rgba(255,255,255,0.35)", textDecorationLine: "line-through" },
  timeRow:      { flexDirection: "row", alignItems: "center", gap: 6 },
  timeLabel:    { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  timeBadge:    { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  timeTxt:      { color: "rgba(255,255,255,0.6)", fontSize: 11 },

  fab:          { position: "absolute", right: 24, bottom: 36, width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabTxt:       { color: "#000", fontSize: 28, fontWeight: "300", marginTop: -2 },

  bottomBtn:    { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },
  btnWrap:      { width: "100%", marginTop: 8 },
  btn:          { width: "100%", height: 56, alignItems: "center", justifyContent: "center", borderRadius: 18, overflow: "hidden" },
  btnTxt:       { color: "#FFF", fontSize: 17, fontWeight: "600", letterSpacing: 0.3 },

  sheetContent:         { gap: 12, paddingBottom: 8 },
  sheetInput:           { color: "#FFF", fontSize: 16, fontWeight: "500", minHeight: 60, paddingVertical: 4 },
  sheetDivider:         { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.12)", marginVertical: 4 },
  sheetDescPlaceholder: { color: "rgba(255,255,255,0.25)", fontSize: 14, paddingVertical: 8 },
});