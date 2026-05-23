import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const calendarBg = require("../assets/2.0/home bg/b1.png");

function ScoreRing({
  score,
  future,
  size = 34,
}: {
  score: number;
  future?: boolean;
  size?: number;
}) {
  const sw = 3.2;
  const cx = size / 2;
  const r = cx - sw / 2 - 0.8;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(score / 100, 1));

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke="#FFFFFF"
          strokeWidth={sw}
          strokeOpacity={future ? 0.22 : 0.14}
          fill="none"
        />
        {!future && score > 0 && (
          <Circle
            cx={cx}
            cy={cx}
            r={r}
            stroke="#FFFFFF"
            strokeWidth={sw}
            fill="none"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        )}
      </Svg>
      {!future && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      )}
    </View>
  );
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// UTC ni bajaye local date use karo (India IST fix)
function getLocalDateStr(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function WeeklyCalendar({
  weeklyScores,
  todayScore,
}: {
  weeklyScores: { date: string; score: number }[];
  todayScore: number;
}) {
  const today = new Date();
  const todayStr = getLocalDateStr(today);

  // This week ni Sunday (local date based)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  // date string → score map
  const scoreByDate: Record<string, number> = {};
  weeklyScores.forEach((item) => {
    scoreByDate[item.date] = item.score ?? 0;
  });

  return (
    <ImageBackground
      source={calendarBg}
      resizeMode="cover"
      style={styles.container}
      imageStyle={{ borderRadius: 18 }}
    >
      {DAY_LABELS.map((label, i) => {
        // i=0 → Sunday of this week, i=6 → Saturday
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = getLocalDateStr(d);

        const isToday = dateStr === todayStr;
        const isFuture = !isToday && dateStr > todayStr;
        const score = isToday
          ? todayScore
          : isFuture
            ? 0
            : (scoreByDate[dateStr] ?? 0);

        return (
          <View
            key={i}
            pointerEvents={isFuture ? "none" : "box-none"}
            style={[
              styles.dayCol,
              isToday && styles.today,
              isFuture && styles.future,
            ]}
          >
            <ScoreRing score={score} future={isFuture} />
            <Text style={[styles.label, isToday && styles.todayLabel]}>
              {label}
            </Text>
          </View>
        );
      })}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 18,
    overflow: "hidden",
    padding: 10,
    justifyContent: "space-between",
  },
  dayCol: {
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    flex: 1,
  },
  today: { backgroundColor: "#656565", borderRadius: 16 },
  future: { opacity: 0.4 },
  label: { color: "#636366", fontSize: 11, fontWeight: "600" },
  todayLabel: { color: "#FFFFFF" },
  center: { alignItems: "center", justifyContent: "center" },
  scoreText: { color: "#FFFFFF", fontSize: 8, fontWeight: "700" },
});
