import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchGoogleFitSteps } from "../../lib/googleFitService";
import { healthEvents } from "../../lib/healthEvents";
import { todoEvents } from "../../lib/todoEvents";
import { getTodayLog, updateDailyLog } from "../../lib/TrackerService";
import { useHealthSteps } from "../../lib/useHealthSteps";
import {
  CardProps,
  HomeModalData,
  HomeModalType,
  TaskItem,
  TimeData,
} from "../../types";

import { ActivityRings } from "../../componunts/ActivityRings";
import { ConfettiOverlay } from "../../componunts/Confetti";

import { MeditationBottomSheet } from "../../componunts/Modals/modals2.0/MeditationBottomSheet";
import { SleepBottomSheet } from "../../componunts/Modals/modals2.0/SleepBottomSheet";
import { StepBottomSheet } from "../../componunts/Modals/modals2.0/StepBottomSheet";
import { WaterBottomSheet } from "../../componunts/Modals/modals2.0/WaterBottomSheet";
import { WorkoutBottomSheet } from "../../componunts/Modals/modals2.0/WorkoutBottomSheet";
import TaskModal from "../../componunts/Modals/TodoModel";
import { WeeklyCalendar } from "../../componunts/WeeklyCalendar";
import { getWeeklyScores } from "../../lib/TrackerService";

import C1 from "../../assets/photo/home/C1.svg";
import C2 from "../../assets/photo/home/C2.svg";

//import card icon
import CC1 from "../../assets/2.0/home icon/C1.svg";
import CC2 from "../../assets/2.0/home icon/C2.svg";
import CC3 from "../../assets/2.0/home icon/C3.svg";
import CC4 from "../../assets/2.0/home icon/C4.svg";
import CC5 from "../../assets/2.0/home icon/C5.svg";
import CC6 from "../../assets/2.0/home icon/C6.svg";

//TITLE ICON
import I1 from "../../assets/2.0/home icon/I1.svg";

//CARD BG
const b4 = require("../../assets/2.0/home bg/b4.png");
const b5 = require("../../assets/2.0/home bg/b5.png");
const b31 = require("../../assets/2.0/home bg/b31.png");
const b32 = require("../../assets/2.0/home bg/b32.png");
const b34 = require("../../assets/2.0/home bg/b34.png");
const b35 = require("../../assets/2.0/home bg/b35.png");
const b36 = require("../../assets/2.0/home bg/b36.png");
const b37 = require("../../assets/2.0/home bg/b37.png");

const CardContainer = ({
  children,
  onPress,
  heightClass = "h-auto",
  className = "",
  style = {},
}: CardProps) => (
  <LinearGradient
    colors={["rgba(255,255,255,0.18)", "rgba(0,0,0,0.18)"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[{ borderRadius: 24, padding: 1 }, style]}
    className={`w-full ${heightClass}`}
  >
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
      className={`w-full rounded-3xl overflow-hidden relative flex-1 ${className}`}
    >
      {children}
    </TouchableOpacity>
  </LinearGradient>
);

export default function HomeScreen() {
  const router = useRouter();

  const [currentScore, setCurrentScore] = useState(0);
  const [activeModal, setActiveModal] = useState<HomeModalType>(null);
  const [animKey, setAnimKey] = useState(0);
  const [weeklyScores, setWeeklyScores] = useState<
    { date: string; score: number }[]
  >([]);

  // Ring progress states
  const [redProgress, setRedProgress] = useState(0); // workout + steps
  const [blueProgress, setBlueProgress] = useState(0); // meditation + water
  const [greenProgress, setGreenProgress] = useState(0); // todo + sleep

  const [meditationData, setMeditationData] = useState("0");
  const [waterData, setWaterData] = useState(0);
  const [stepData, setStepData] = useState("0");
  const [sleepData, setSleepData] = useState<TimeData>({
    hour: "08",
    minute: "24",
  });
  const [todoTasks, setTodoTasks] = useState<TaskItem[]>([]);
  const [workoutData, setWorkoutData] = useState<TimeData>({
    hour: "00",
    minute: "00",
  });

  const [isMeditationDone, setIsMeditationDone] = useState(false);
  const [isWaterDone, setIsWaterDone] = useState(false);
  const [isTodoDone, setIsTodoDone] = useState(false);
  const [isStepDone, setIsStepDone] = useState(false);
  const [isSleepDone, setIsSleepDone] = useState(false);
  const [isWorkoutDone, setIsWorkoutDone] = useState(false);

  // ── Confetti ──────────────────────────────────────────────────────────────
  const [confetti, setConfetti] = useState<"mini" | "big" | null>(null);
  const handleConfettiDone = useCallback(() => setConfetti(null), []);

  // Goals
  const workoutGoalMins = 45;
  const stepsGoal = 8000;
  const meditationGoalMins = 20;
  const waterGoal = 3.5;
  const sleepGoalHours = 8;

  const workoutMinsNow =
    parseInt(workoutData.hour || "0") * 60 +
    parseInt(workoutData.minute || "0");
  const stepsNow = parseInt(stepData || "0");
  const meditationMinsNow = parseInt(meditationData || "0");
  const sleepHoursNow =
    parseInt(sleepData.hour || "0") + parseInt(sleepData.minute || "0") / 60;
  const todosDoneNow = todoTasks.filter(
    (t) => t.isDone && t.text?.trim() !== "",
  ).length;
  const todosTotalNow = todoTasks.filter((t) => t.text?.trim() !== "").length;

  // 🔴 Red = Workout + Steps  |  🔵 Blue = Water + Meditation  |  🟢 Green = Tasks only
  const workoutOk = isWorkoutDone && workoutMinsNow >= workoutGoalMins;
  const stepsOk = isStepDone && stepsNow >= stepsGoal;
  const meditationOk =
    isMeditationDone && meditationMinsNow >= meditationGoalMins;
  const waterOk = isWaterDone && waterData >= waterGoal;
  const sleepOk = isSleepDone && sleepHoursNow >= sleepGoalHours; // score ma only, ring nahi
  const todosOk =
    isTodoDone && todosTotalNow > 0 && todosDoneNow >= todosTotalNow;
  const redOk = redProgress >= 1;
  const blueOk = blueProgress >= 1;
  const greenOk = greenProgress >= 1;
  const allRingsOk = redOk && blueOk && greenOk;
  const score100 = currentScore >= 100;

  const prevConfettiRef = useRef({
    workoutOk,
    stepsOk,
    meditationOk,
    waterOk,
    sleepOk,
    todosOk,
    redOk,
    blueOk,
    greenOk,
    allRingsOk,
    score100,
  });
  const firstRenderConfetti = useRef(true);
  const isRefreshingRef = useRef(false); // refreshAll thi update thay tyare confetti skip karo

  useEffect(() => {
    if (firstRenderConfetti.current) {
      firstRenderConfetti.current = false;
      prevConfettiRef.current = {
        workoutOk,
        stepsOk,
        meditationOk,
        waterOk,
        sleepOk,
        todosOk,
        redOk,
        blueOk,
        greenOk,
        allRingsOk,
        score100,
      };
      return;
    }

    // refreshAll thi load thay tyare confetti na trigger thavvu joie
    if (isRefreshingRef.current) {
      prevConfettiRef.current = {
        workoutOk,
        stepsOk,
        meditationOk,
        waterOk,
        sleepOk,
        todosOk,
        redOk,
        blueOk,
        greenOk,
        allRingsOk,
        score100,
      };
      return;
    }
    const p = prevConfettiRef.current;
    const bigTrigger =
      (!p.allRingsOk && allRingsOk) || (!p.score100 && score100);
    const miniTrigger =
      (!p.workoutOk && workoutOk) ||
      (!p.stepsOk && stepsOk) ||
      (!p.meditationOk && meditationOk) ||
      (!p.waterOk && waterOk) ||
      (!p.sleepOk && sleepOk) ||
      (!p.todosOk && todosOk) ||
      (!p.redOk && redOk) ||
      (!p.blueOk && blueOk) ||
      (!p.greenOk && greenOk);

    if (bigTrigger) {
      setConfetti("big");
    } else if (miniTrigger) {
      setConfetti("mini");
    }
    prevConfettiRef.current = {
      workoutOk,
      stepsOk,
      meditationOk,
      waterOk,
      sleepOk,
      todosOk,
      redOk,
      blueOk,
      greenOk,
      allRingsOk,
      score100,
    };
  }, [
    workoutOk,
    stepsOk,
    meditationOk,
    waterOk,
    sleepOk,
    todosOk,
    redOk,
    blueOk,
    greenOk,
    allRingsOk,
    score100,
  ]);
  // ──────────────────────────────────────────────────────────────────────────

  const isSyncingSteps = useRef(false);
  const lastStepSyncTime = useRef<number>(0);

  // refreshAll ને ref માં રાખો — stale closure problem નહીં
  const refreshAllRef = useRef<() => Promise<void>>(
    undefined as unknown as () => Promise<void>,
  );

  // HealthKit — iOS only (Android pe null)
  const { requestAuthorization, stepStats } = useHealthSteps();

  // iOS — app open thata j HealthKit permission maango
  useEffect(() => {
    if (Platform.OS === "ios") {
      requestAuthorization().catch(() => {});
    }
  }, []);

  // ── Ring recalculate helper — Apple app style, instant update ────────────
  const recalcRings = useCallback(
    (
      wData: TimeData,
      sData: string,
      mData: string,
      wtrData: number,
      tData: TaskItem[],
    ) => {
      const wMins =
        parseInt(wData.hour || "0") * 60 + parseInt(wData.minute || "0");
      const steps = parseInt(sData || "0");
      const mMins = parseInt(mData || "0");
      const todoDone = tData.filter(
        (t) => t.isDone && t.text?.trim() !== "",
      ).length;
      const todoTotal = tData.filter((t) => t.text?.trim() !== "").length;

      // 🔴 Workout + Steps
      setRedProgress((Math.min(wMins / 45, 1) + Math.min(steps / 8000, 1)) / 2);
      // 🔵 Water + Meditation
      setBlueProgress(
        (Math.min(wtrData / 3.5, 1) + Math.min(mMins / 20, 1)) / 2,
      );
      // 🟢 Tasks — max 3 tasks consider karva, each task = 1/3 ring
      // 1 task done = 33%, 2 = 66%, 3 = 100% — total < 3 hoy to bhi proportional
      const effectiveTotal = Math.max(todoTotal, 3);
      setGreenProgress(todoTotal > 0 ? todoDone / effectiveTotal : 0);
    },
    [],
  );

  const handleSave = async (type: HomeModalType, value: HomeModalData) => {
    // 1. Local state update + latest values track karva
    let newWorkout = workoutData;
    let newSteps = stepData;
    let newMeditation = meditationData;
    let newWater = waterData;
    let newTodos = todoTasks;

    if (type === "meditation" && typeof value === "string") {
      setMeditationData(value);
      setIsMeditationDone(true);
      newMeditation = value;
    }
    if (type === "water" && typeof value === "number") {
      setWaterData(value);
      setIsWaterDone(true);
      newWater = value;
    }
    if (type === "todo" && Array.isArray(value)) {
      setTodoTasks(value);
      setIsTodoDone(true);
      newTodos = value;
    }
    if (type === "step" && typeof value === "string") {
      setStepData(value);
      setIsStepDone(true);
      newSteps = value;
    }
    if (type === "sleep" && typeof value === "object" && "hour" in value) {
      setSleepData(value as TimeData);
      setIsSleepDone(true);
      // sleep ring ma nathi — recalc nathi karvo
    }
    if (type === "workout" && typeof value === "object" && "hour" in value) {
      setWorkoutData(value as TimeData);
      setIsWorkoutDone(true);
      newWorkout = value as TimeData;
    }

    // 2. Rings instantly recalculate (Apple app style — no Supabase wait)
    recalcRings(newWorkout, newSteps, newMeditation, newWater, newTodos);
    setAnimKey((k) => k + 1);
    setActiveModal(null);

    // 3. Supabase save + score update
    if (type) {
      const result = await updateDailyLog(type, value);
      if (result.success && result.newScore !== undefined) {
        setCurrentScore(result.newScore);
      }
    }
  };

  const autoSyncSteps = useCallback(async () => {
    if (isSyncingSteps.current) return;
    const now = Date.now();
    if (now - lastStepSyncTime.current < 600000) return;
    isSyncingSteps.current = true;
    lastStepSyncTime.current = now;
    try {
      let steps: number | null = null;
      if (Platform.OS === "android") {
        steps = await fetchGoogleFitSteps();
      }
      // iOS mate autoSync ma koi save nahi — stepStats useEffect handle karshe
      if (steps !== null && steps !== undefined && Platform.OS === "android") {
        setStepData(steps.toString());
        setIsStepDone(true);
        recalcRings(
          workoutData,
          steps.toString(),
          meditationData,
          waterData,
          todoTasks,
        );
        const result = await updateDailyLog("step", steps.toString());
        if (result.success && result.newScore !== undefined)
          setCurrentScore(result.newScore);
      }
    } catch (error) {
    } finally {
      isSyncingSteps.current = false;
    }
  }, []);

  const handleStepPress = async () => {
    try {
      // iOS — pehla HealthKit authorization maango
      if (Platform.OS === "ios") {
        await requestAuthorization();
      }

      let steps: number | null = null;
      if (Platform.OS === "android") {
        steps = await fetchGoogleFitSteps();
      } else if (Platform.OS === "ios") {
        const qty = stepStats?.sumQuantity;
        const fetched = Math.round(
          typeof qty === "number" ? qty : ((qty as any)?.quantity ?? 0),
        );
        // HealthKit connected hoy ane steps > 0 hoy to use karo
        steps = fetched > 0 ? fetched : null;
      }

      if (steps !== null && steps !== undefined) {
        // Steps mili gaya — auto save
        lastSyncedSteps.current = steps;
        setStepData(steps.toString());
        setIsStepDone(true);
        await handleSave("step", steps.toString());
      } else {
        // Steps na mili — HealthKit connected nathi — manual modal open karo
        setActiveModal("step");
      }
    } catch (error) {
      // Error aavi — manual modal open karo
      setActiveModal("step");
    }
  };

  // ✅ refreshAll — Supabase માંથી fresh data fetch કરી બધા states update કરે
  const refreshAll = useCallback(async () => {
    try {
      isRefreshingRef.current = true;

      // Weekly scores always fetch karo — data hoy ke na hoy
      const weekly = await getWeeklyScores();
      setWeeklyScores(weekly);

      const data = await getTodayLog();
      if (!data) {
        setRedProgress(0);
        setBlueProgress(0);
        setGreenProgress(0);
        setAnimKey((k) => k + 1);
        return;
      }

      // Score
      if (data.score != null) setCurrentScore(data.score);

      // Todo
      const tasks: TaskItem[] = data.todo_list ?? [];
      setTodoTasks(tasks);
      setIsTodoDone(
        tasks.filter((t: TaskItem) => t.text.trim() !== "").length > 0,
      );

      // Meditation
      if (data.meditation_time != null) {
        setMeditationData(data.meditation_time);
        setIsMeditationDone(true);
      }

      // Water
      if (data.water_intake != null) {
        setWaterData(data.water_intake);
        setIsWaterDone(true);
      }

      // Sleep
      if (data.sleep_data != null) {
        setSleepData(data.sleep_data);
        setIsSleepDone(true);
      }

      // Workout
      if (data.workout_time != null) {
        setWorkoutData(data.workout_time);
        setIsWorkoutDone(true);
      }

      // Steps
      if (data.step_count != null) {
        setStepData(data.step_count.toString());
        setIsStepDone(true);
      } else if (Platform.OS === "ios") {
        // Supabase ma nahi pan HealthKit ma hoy to — stepStats check karo
        const qty = stepStats?.sumQuantity;
        const hkSteps = Math.round(
          typeof qty === "number" ? qty : ((qty as any)?.quantity ?? 0),
        );
        if (hkSteps > 0) {
          setStepData(hkSteps.toString());
          setIsStepDone(true);
        }
      }

      // Ring progress calculate karo
      const workoutH = parseInt(data.workout_time?.hour || "0");
      const workoutM = parseInt(data.workout_time?.minute || "0");
      const workoutMins = workoutH * 60 + workoutM;
      const stepsVal = parseInt(data.step_count?.toString() || "0");
      const meditationMins = parseInt(data.meditation_time || "0");
      const waterVal = data.water_intake || 0;
      const sleepH = parseInt(data.sleep_data?.hour || "0");
      const sleepM = parseInt(data.sleep_data?.minute || "0");
      const sleepHours = sleepH + sleepM / 60;
      const todosDone = (data.todo_list || []).filter(
        (t: TaskItem) => t.isDone,
      ).length;
      const todosTotal = (data.todo_list || []).filter(
        (t: TaskItem) => t.text?.trim() !== "",
      ).length;

      // 🔴 Red  = Workout + Steps
      // 🔵 Blue = Water + Meditation
      // 🟢 Green = Tasks only  (sleep score ma che, ring ma nahi)
      setRedProgress(
        (Math.min(workoutMins / 45, 1) + Math.min(stepsVal / 8000, 1)) / 2,
      );
      setBlueProgress(
        (Math.min(waterVal / 3.5, 1) + Math.min(meditationMins / 20, 1)) / 2,
      );
      // 🟢 Green = Tasks — max 3 tasks, each = 1/3 ring
      const effectiveTodoTotal = Math.max(todosTotal, 3);
      setGreenProgress(todosTotal > 0 ? todosDone / effectiveTodoTotal : 0);
    } finally {
      // Thodi delay sathe reset — jethhi state update complete thay
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 500);
    }
  }, []);

  // ref ને always latest refreshAll point karavo
  useEffect(() => {
    refreshAllRef.current = refreshAll;
  }, [refreshAll]);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
      autoSyncSteps();
    }, [refreshAll, autoSyncSteps]),
  );

  // todoEvents subscribe — AI todo tab thi task add/remove thay tyare update
  useEffect(() => {
    const unsubscribe = todoEvents.subscribe(async () => {
      const data = await getTodayLog();
      if (!data) return;

      const tasks: TaskItem[] = data.todo_list ?? [];
      setTodoTasks(tasks);
      setIsTodoDone(
        tasks.filter((t: TaskItem) => t.text.trim() !== "").length > 0,
      );

      if (data.score != null) setCurrentScore(data.score);

      const wMins =
        parseInt(data.workout_time?.hour || "0") * 60 +
        parseInt(data.workout_time?.minute || "0");
      const stepsVal = parseInt(data.step_count?.toString() || "0");
      const mMins = parseInt(data.meditation_time || "0");
      const waterVal = data.water_intake || 0;
      const todosDone = tasks.filter(
        (t: TaskItem) => t.isDone && t.text?.trim() !== "",
      ).length;
      const todosTotal = tasks.filter(
        (t: TaskItem) => t.text?.trim() !== "",
      ).length;

      setRedProgress(
        (Math.min(wMins / 45, 1) + Math.min(stepsVal / 8000, 1)) / 2,
      );
      setBlueProgress(
        (Math.min(waterVal / 3.5, 1) + Math.min(mMins / 20, 1)) / 2,
      );
      setGreenProgress(todosTotal > 0 ? todosDone / Math.max(todosTotal, 3) : 0);
      setAnimKey((k) => k + 1);
    });
    return unsubscribe;
  }, []);

  // healthEvents subscribe — AI health tab thi workout/water/sleep/meditation update thay tyare
  useEffect(() => {
    const unsubscribe = healthEvents.subscribe(async () => {
      const data = await getTodayLog();
      if (!data) return;

      if (data.score != null) setCurrentScore(data.score);

      // Meditation
      if (data.meditation_time != null) {
        setMeditationData(data.meditation_time);
        setIsMeditationDone(true);
      }
      // Water
      if (data.water_intake != null) {
        setWaterData(data.water_intake);
        setIsWaterDone(true);
      }
      // Sleep
      if (data.sleep_data != null) {
        setSleepData(data.sleep_data);
        setIsSleepDone(true);
      }
      // Workout
      if (data.workout_time != null) {
        setWorkoutData(data.workout_time);
        setIsWorkoutDone(true);
      }

      // Ring recalc
      const tasks: TaskItem[] = data.todo_list ?? [];
      const wMins =
        parseInt(data.workout_time?.hour || "0") * 60 +
        parseInt(data.workout_time?.minute || "0");
      const stepsVal = parseInt(data.step_count?.toString() || "0");
      const mMins = parseInt(data.meditation_time || "0");
      const waterVal = data.water_intake || 0;
      const todosDone = tasks.filter(
        (t: TaskItem) => t.isDone && t.text?.trim() !== "",
      ).length;
      const todosTotal = tasks.filter(
        (t: TaskItem) => t.text?.trim() !== "",
      ).length;

      setRedProgress(
        (Math.min(wMins / 45, 1) + Math.min(stepsVal / 8000, 1)) / 2,
      );
      setBlueProgress(
        (Math.min(waterVal / 3.5, 1) + Math.min(mMins / 20, 1)) / 2,
      );
      setGreenProgress(todosTotal > 0 ? todosDone / Math.max(todosTotal, 3) : 0);
      setAnimKey((k) => k + 1);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      autoSyncSteps();
    }, 600000);
    return () => clearInterval(interval);
  }, [autoSyncSteps]);

  const lastSyncedSteps = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const qty = stepStats?.sumQuantity;
    const steps = Math.round(
      typeof qty === "number" ? qty : ((qty as any)?.quantity ?? 0),
    );
    if (steps > 0 && steps !== lastSyncedSteps.current) {
      lastSyncedSteps.current = steps;
      setStepData(steps.toString());
      setIsStepDone(true);
      recalcRings(
        workoutData,
        steps.toString(),
        meditationData,
        waterData,
        todoTasks,
      );
      setTimeout(() => {
        updateDailyLog("step", steps.toString()).then((result) => {
          if (result.success && result.newScore !== undefined)
            setCurrentScore(result.newScore);
        });
      }, 500);
    }
  }, [
    stepStats?.sumQuantity,
    workoutData,
    meditationData,
    waterData,
    todoTasks,
  ]);

  const homeBg = require("../../assets/photo/login/2.0/home.png");
  const ringbg = require("../../assets/2.0/home bg/b2.png");

  return (
    <>
      <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 bg-transparent">
          <StatusBar
            barStyle="light-content"
            translucent
            backgroundColor="transparent"
          />

          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 110,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Weekly Calendar + Activity Rings */}
            <View>
              <View style={{ gap: 16 }}>
                {/* Weekly Calendar */}
                <LinearGradient
                  colors={["rgba(255,255,255,0.18)", "rgba(0,0,0,0.18)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 20, padding: 1 }}
                >
                  <WeeklyCalendar
                    weeklyScores={weeklyScores}
                    todayScore={currentScore}
                  />
                </LinearGradient>
                {/* Activity Rings */}
                <LinearGradient
                  colors={["rgba(255,255,255,0.18)", "rgba(0,0,0,0.18)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 26, padding: 1 }}
                >
                  <ImageBackground
                    source={ringbg}
                    resizeMode="cover"
                    style={{
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 24,
                      overflow: "hidden",
                      padding: 16,
                    }}
                  >
                    <ActivityRings
                      red={redProgress}
                      blue={blueProgress}
                      green={greenProgress}
                      score={currentScore}
                      size={240}
                      animKey={animKey}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 16,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#FF375F",
                          }}
                        />
                        <Text style={{ color: "#FFFFFF", fontSize: 11 }}>
                          Move & Workout
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#0A84FF",
                          }}
                        />
                        <Text style={{ color: "#FFFFFF", fontSize: 11 }}>
                          Mindful & Hydrate
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#30D158",
                          }}
                        />
                        <Text style={{ color: "#FFFFFF", fontSize: 11 }}>
                          Task Done
                        </Text>
                      </View>
                    </View>
                  </ImageBackground>
                </LinearGradient>
              </View>
            </View>

            <View className="flex-row items-center gap-2 mb-4 mt-6">
              <I1 />
              <Text className="text-lg font-semibold text-white">
                Superhuman Elements
              </Text>
            </View>

            <View className="flex-row justify-between gap-3">
              <View className="flex-1 gap-3">
                <CardContainer
                  onPress={() => setActiveModal("meditation")}
                  heightClass="h-28"
                  className=""
                >
                  <Image
                    source={b31}
                    className="absolute w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="p-4 h-full flex-row items-center gap-4">
                    {!isMeditationDone ? (
                      <>
                        <CC1 height={45} width={45} />
                        <View className="w-[1px] h-8 bg-[#E5E5EA]" />
                        <Text className="text-white font-medium text-sm">
                          Mind clear. Soul{"\n"}light.
                        </Text>
                      </>
                    ) : (
                      <>
                        <CC1 height={45} width={45} />
                        <View className="w-[1px] h-8 bg-[#E5E5EA]" />
                        <View>
                          {/* <View className="bg-[#FFFFFF1A] px-2 py-0.5 rounded-full self-start mb-1"> */}
                          <Text className="text-[#CCCCCC] text-[12px] font-bold">
                            Meditation
                          </Text>
                          {/* </View> */}
                          <Text className="text-white text-2xl font-black">
                            {parseInt(meditationData || "0")}m
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </CardContainer>

                <CardContainer
                  onPress={() => setActiveModal("workout")}
                  heightClass="h-24"
                >
                  <Image
                    source={b32}
                    className="absolute w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="p-4 h-full flex-row items-center gap-4">
                    {!isWorkoutDone ? (
                      <>
                        <CC2 height={45} width={45} />
                        <View className="w-[1px] h-8 bg-[#E5E5EA]" />
                        <Text className="text-white font-medium text-sm">
                          Strength built in{"\n"}Stillness.
                        </Text>
                      </>
                    ) : (
                      <>
                        <CC2 height={45} width={45} />
                        <View className="w-[1px] h-8 bg-[#E5E5EA]" />
                        <View>
                          {/* <View className="bg-[#FFFFFF1A] px-2 py-0.5 rounded-full self-start mb-1"> */}
                          <Text className="text-[#CCCCCC] text-[12px] font-bold">
                            Workout
                          </Text>
                          {/* </View> */}
                          <Text className="text-white text-2xl font-black">
                            {workoutData.hour}h {workoutData.minute}m
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </CardContainer>

                <CardContainer
                  onPress={() => setActiveModal("water")}
                  heightClass="h-56"
                  style={{ minHeight: 200 }}
                >
                  {!isWaterDone ? (
                    <>
                      <Image
                        source={b34}
                        className="absolute w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="p-4 items-center justify-between h-full py-6">
                        <CC3 height={50} width={50} />
                        <Text className="text-white text-center font-medium text-sm">
                          Water brings life,health,{"\n"} and happiness.
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Image
                        source={b4}
                        className="absolute w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="p-4 items-center justify-center h-full py-6 gap-3">
                        <View className="items-center">
                          <Text className="text-white text-center font-medium text-[10px] leading-3 mb-2">
                            Water brings life,health,{"\n"} and happiness.
                          </Text>
                          <Text className="text-white text-3xl font-black">
                            {waterData}ltr
                          </Text>
                        </View>
                        <CC3 width={60} height={60} />
                      </View>
                    </>
                  )}
                </CardContainer>
              </View>

              <View className="flex-1 gap-3">
                <CardContainer onPress={handleStepPress} heightClass="h-24">
                  <Image
                    source={b35}
                    className="absolute w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="p-4 h-full flex-row items-center gap-4">
                    {!isStepDone ? (
                      <>
                        <CC4 height={45} width={45} />
                        <View className="w-[1px] h-8 bg-[#E5E5EA]" />
                        <Text className="flex-1 text-white font-medium text-sm">
                          Mindful steps,{"\n"}peaceful path.
                        </Text>
                      </>
                    ) : (
                      <>
                        <CC4 height={45} width={45} />
                        <View className="w-[1px] h-8 bg-[#E5E5EA]" />
                        <View>
                          {/* <View className="bg-[#FFFFFF1A] px-2 py-0.5 rounded-full self-start mb-1"> */}
                          <Text className="text-[#CCCCCC] text-[12px] font-bold">
                            Steps
                          </Text>
                          {/* </View> */}
                          <Text className="text-white text-2xl font-black">
                            {stepData}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </CardContainer>

                <CardContainer
                  onPress={() => router.push("/todo")}
                  heightClass="h-56"
                  style={{ minHeight: 200 }}
                  className="items-center justify-center"
                >
                  {!isTodoDone ? (
                    <>
                      <Image
                        source={b36}
                        className="absolute w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="p-4 items-center justify-between h-full">
                        <CC5 height={50} width={50} />
                        <Text className="text-white text-center font-medium text-sm mb-2">
                          Write a small to-do list for Superhuman Work.
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Image
                        source={b5}
                        className="absolute w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="p-4 items-start">
                        <Text className="text-white text-1xl font-black mt-4">
                          Things to do today
                        </Text>
                        <View className="items-center justify-start mb-4 mt-4">
                          {todoTasks
                            .filter((t) => t.text !== "")
                            .slice(0, 3)
                            .map((item, index) => (
                              <View
                                key={index}
                                className="flex-row items-center gap-2 mt-2"
                              >
                                {item.isDone ? (
                                  <C2 width={18} height={18} />
                                ) : (
                                  <C1 height={18} width={18} />
                                )}
                                <Text
                                  numberOfLines={1}
                                  className={`text-[13px] font-semibold flex-1 ${item.isDone ? "text-[#bbb9b9] line-through" : "text-white"}`}
                                >
                                  {item.text}
                                </Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    </>
                  )}
                </CardContainer>

                <CardContainer
                  onPress={() => setActiveModal("sleep")}
                  heightClass="h-28"
                >
                  <Image
                    source={b37}
                    className="absolute w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="p-4 h-full flex-row items-center gap-4">
                    {!isSleepDone ? (
                      <>
                        <CC6 height={45} width={45} />
                        <View className="w-[1px] h-8 bg-[#E5E5EA]" />
                        <Text className="text-white font-medium text-sm">
                          Quiet mind.{"\n"}Deep Sleep.
                        </Text>
                      </>
                    ) : (
                      <>
                        <CC6 height={45} width={45} />
                        <View className="w-[1px] h-8 bg-[#E5E5EA]" />
                        <View>
                          {/* <View className="bg-[#FFFFFF1A] px-2 py-0.5 rounded-full self-start mb-1"> */}
                          <Text className="text-[#CCCCCC] text-[12px] font-bold">
                            Sleep
                          </Text>
                          {/* </View> */}
                          <Text className="text-white text-2xl font-black">
                            {sleepData.hour}h {sleepData.minute}m
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </CardContainer>
              </View>
            </View>
          </ScrollView>

          <MeditationBottomSheet
            isVisible={activeModal === "meditation"}
            onClose={() => setActiveModal(null)}
            onSave={(val) => handleSave("meditation", val)}
            initialValue={meditationData}
          />
          <WaterBottomSheet
            isVisible={activeModal === "water"}
            onClose={() => setActiveModal(null)}
            onSave={(val) => handleSave("water", val)}
            initialValue={waterData}
          />
          <TaskModal
            isVisible={activeModal === "todo"}
            onClose={() => setActiveModal(null)}
            onSave={(val) => handleSave("todo", val)}
            initialTasks={todoTasks}
          />
          <StepBottomSheet
            isVisible={activeModal === "step"}
            onClose={() => setActiveModal(null)}
            onSave={(val) => handleSave("step", val)}
            initialValue={stepData}
          />
          <SleepBottomSheet
            isVisible={activeModal === "sleep"}
            onClose={() => setActiveModal(null)}
            onSave={(val) => {
              handleSave("sleep", {
                hour: String(val.hours).padStart(2, "0"),
                minute: String(val.minutes).padStart(2, "0"),
                bedH: val.bedH,
                bedM: val.bedM,
                wakeH: val.wakeH,
                wakeM: val.wakeM,
              });
            }}
            initialValue={
              isSleepDone
                ? {
                    hours: parseInt(sleepData.hour || "0"),
                    minutes: parseInt(sleepData.minute || "0"),
                    bedH: (sleepData as any).bedH,
                    bedM: (sleepData as any).bedM,
                    wakeH: (sleepData as any).wakeH,
                    wakeM: (sleepData as any).wakeM,
                  }
                : undefined
            }
          />
          <WorkoutBottomSheet
            isVisible={activeModal === "workout"}
            onClose={() => setActiveModal(null)}
            onSave={(val) => handleSave("workout", val)}
            initialValue={workoutData}
          />
        </SafeAreaView>
      </ImageBackground>
      <ConfettiOverlay type={confetti} onComplete={handleConfettiDone} />
    </>
  );
}
