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

export function WeeklyCalendar({
  weeklyScores,
  todayScore,
}: {
  weeklyScores: { date: string; score: number }[];
  todayScore: number;
}) {
  const todayIdx = new Date().getDay();

  // date → dayIndex map
  const scoreMap: Record<number, number> = {};
  weeklyScores.forEach((item) => {
    const dayIdx = new Date(item.date + "T00:00:00").getDay();
    scoreMap[dayIdx] = item.score ?? 0;
  });

  return (
    <ImageBackground
      source={calendarBg}
      resizeMode="cover"
      style={styles.container}
      imageStyle={{ borderRadius: 18 }}
    >
      {DAY_LABELS.map((label, i) => {
        const isToday = i === todayIdx;
        const isFuture = i > todayIdx;
        const score = isToday ? todayScore : isFuture ? 0 : (scoreMap[i] ?? 0);

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
