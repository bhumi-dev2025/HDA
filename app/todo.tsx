import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  ImageBackground,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBottomSheet } from "../componunts/Modals/modals2.0/AppBottomSheet";
import { getTodayLog, updateDailyLog } from "../lib/TrackerService";
import { todoEvents } from "../lib/todoEvents";

import M4 from "../assets/2.0/model/M4.svg";
import C1 from "../assets/photo/home/C1.svg";
import C2 from "../assets/photo/home/C2.svg";

const homeBg = require("../assets/photo/login/2.0/home.png");
const btnBg = require("../assets/2.0/model/button.png");

type Task = { text: string; isDone: boolean; time?: string };

const dateToTimeStr = (d: Date): string => {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
};

const timeStrToDate = (t: string): Date => {
  const [time, period] = t.split(" ");
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export default function TodoPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  // iOS only — picker show/hide flag + date
  const [iosPickerDate, setIosPickerDate] = useState<Date>(new Date());
  const [showIosPicker, setShowIosPicker] = useState(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const data = await getTodayLog();
      if (data?.todo_list && data.todo_list.length > 0)
        setTasks(data.todo_list);
      setLoading(false);
    })();
  }, []);

  const saveTasks = async (updated: Task[]) => {
    setTasks(updated);
    await updateDailyLog("todo", updated);
    todoEvents.emit();
  };

  const toggleTask = async (i: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await saveTasks(
      tasks.map((t, idx) => (idx === i ? { ...t, isDone: !t.isDone } : t)),
    );
  };

  // Time picker open — Android: native dialog | iOS: spinner modal
  const openTimePicker = () => {
    const initDate = selectedTime ? timeStrToDate(selectedTime) : new Date();
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "time",
        value: initDate,
        is24Hour: false,
        onChange: (event, date) => {
          if (event.type === "set" && date) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedTime(dateToTimeStr(date));
          }
        },
      });
    } else {
      // iOS — pehla keyboard dismiss karo, pachhi spinner show karo
      Keyboard.dismiss();
      setIosPickerDate(initDate);
      setShowIosPicker(true);
    }
  };

  const openAdd = () => {
    if (tasks.filter((t) => t.text.trim() !== "").length >= 3) return;
    setEditIdx(null);
    setInputText("");
    setSelectedTime(undefined);
    setIosPickerDate(new Date());
    setShowIosPicker(false);
    setSheetOpen(true);
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  const openEdit = (i: number) => {
    if (tasks[i].isDone) return;
    setEditIdx(i);
    setInputText(tasks[i].text);
    setSelectedTime(tasks[i].time);
    setIosPickerDate(tasks[i].time ? timeStrToDate(tasks[i].time) : new Date());
    setShowIosPicker(false);
    setSheetOpen(true);
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  const handleSave = async () => {
    if (!inputText.trim()) return;
    setShowIosPicker(false);
    if (editIdx !== null) {
      await saveTasks(
        tasks.map((t, i) =>
          i === editIdx
            ? { ...t, text: inputText.trim(), time: selectedTime }
            : t,
        ),
      );
      setSheetOpen(false);
      setInputText("");
      setSelectedTime(undefined);
      setEditIdx(null);
    } else {
      const updated = [
        ...tasks,
        { text: inputText.trim(), isDone: false, time: selectedTime },
      ];
      await saveTasks(updated);
      setInputText("");
      setSelectedTime(undefined);
      if (updated.filter((t) => t.text.trim() !== "").length >= 3)
        setSheetOpen(false);
    }
  };

  const isEditing = editIdx !== null;
  const hasData = tasks.filter((t) => t.text.trim() !== "").length > 0;
  const taskCount = tasks.filter((t) => t.text.trim() !== "").length;

  return (
    <ImageBackground source={homeBg} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Todo lists</Text>
          <View style={{ width: 36 }} />
        </View>

        {loading ? (
          <View style={s.emptyWrap} />
        ) : !hasData ? (
          <View style={s.emptyWrap}>
            <M4 width={120} height={120} />
            <Text style={s.emptyTitle}>No todo list yet</Text>
            <Text style={s.emptyDesc}>
              Add your first todo list to stay organised and track{"\n"}your
              tasks with ease.
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
                <TouchableOpacity
                  onPress={() => toggleTask(item.originalIndex)}
                  style={s.checkbox}
                >
                  {item.isDone ? (
                    <C2 width={22} height={22} />
                  ) : (
                    <C1 width={22} height={22} />
                  )}
                </TouchableOpacity>
                <View style={s.taskInfo}>
                  <Text
                    style={[s.taskText, item.isDone && s.taskDone]}
                    numberOfLines={2}
                  >
                    {item.text}
                  </Text>
                  {item.time && (
                    <View style={s.timeRow}>
                      <Text style={s.timeLabel}>I will finish this by</Text>
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

        {!hasData ? (
          <View style={s.bottomBtn}>
            <TouchableOpacity onPress={openAdd} activeOpacity={0.85}>
              <ImageBackground
                source={btnBg}
                style={s.btn}
                imageStyle={{ borderRadius: 18 }}
                resizeMode="cover"
              >
                <Text style={s.btnTxt}>Add Task</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        ) : taskCount < 3 ? (
          <TouchableOpacity onPress={openAdd} style={s.fab}>
            <Text style={s.fabTxt}>+</Text>
          </TouchableOpacity>
        ) : null}
      </SafeAreaView>

      <AppBottomSheet
        isVisible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        enableDynamicSizing={true}
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

          {/* Time row */}
          <View style={s.timePickerRow}>
            <TouchableOpacity
              onPress={openTimePicker}
              activeOpacity={0.7}
              style={s.timePickerBtn}
            >
              <Text style={s.timePickerIcon}>🕐</Text>
              <Text
                style={[s.timePickerTxt, selectedTime && s.timePickerTxtSet]}
              >
                {selectedTime
                  ? `Finish by  ${selectedTime}`
                  : "Set finish time"}
              </Text>
            </TouchableOpacity>

            {selectedTime && !showIosPicker && (
              <TouchableOpacity
                onPress={() => setSelectedTime(undefined)}
                hitSlop={12}
                style={s.clearBtn}
              >
                <Text style={s.clearTxt}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* iOS spinner — shows only when user taps "Set finish time" */}
          {Platform.OS === "ios" && showIosPicker && (
            <View style={s.iosPickerWrap}>
              <DateTimePicker
                mode="time"
                value={iosPickerDate}
                display="spinner"
                themeVariant="dark"
                style={s.iosSpinner}
                onChange={(_, date) => {
                  if (date) {
                    setIosPickerDate(date);
                    setSelectedTime(dateToTimeStr(date));
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => setShowIosPicker(false)}
                style={s.iosDoneBtn}
              >
                <Text style={s.iosDoneTxt}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            style={s.btnWrap}
          >
            <ImageBackground
              source={btnBg}
              style={s.btn}
              imageStyle={{ borderRadius: 18 }}
              resizeMode="cover"
            >
              <Text style={s.btnTxt}>
                {isEditing ? "Update task" : "Add Task"}
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: "#FFF", fontSize: 28, lineHeight: 32, marginTop: -2 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  emptyDesc: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 12,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  checkbox: { marginTop: 2 },
  taskInfo: { flex: 1, gap: 6 },
  taskText: { color: "#FFF", fontSize: 15, fontWeight: "600", lineHeight: 22 },
  taskDone: {
    color: "rgba(255,255,255,0.35)",
    textDecorationLine: "line-through",
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  timeBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeTxt: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 36,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabTxt: { color: "#000", fontSize: 28, fontWeight: "300", marginTop: -2 },
  bottomBtn: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },
  btnWrap: { width: "100%", marginTop: 4 },
  btn: {
    width: "100%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    overflow: "hidden",
  },
  btnTxt: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  sheetContent: { gap: 12, paddingBottom: 8 },
  sheetInput: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    minHeight: 48,
    paddingVertical: 4,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 2,
  },

  // Time picker row
  timePickerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timePickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  timePickerIcon: { fontSize: 16 },
  timePickerTxt: {
    flex: 1,
    color: "rgba(255,255,255,0.35)",
    fontSize: 14,
    fontWeight: "500",
  },
  timePickerTxtSet: { color: "#FFF" },
  clearBtn: { padding: 8 },
  clearTxt: { color: "rgba(255,255,255,0.4)", fontSize: 14 },

  // iOS spinner picker
  iosPickerWrap: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 4,
  },
  iosSpinner: { width: "100%", height: 150 },
  iosDoneBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iosDoneTxt: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
