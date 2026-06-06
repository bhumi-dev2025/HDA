import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import L1 from "../assets/2.0/path/LI.svg";
import CatButton from "../componunts/CatButton";
import { AppBottomSheet } from "../componunts/Modals/modals2.0/AppBottomSheet";
import PathButton from "../componunts/PathButton";
import { HDA_LESSONS, Lesson } from "../constants/hdaPathData";

const { width: W } = Dimensions.get("window");
const homeBg = require("../assets/photo/login/2.0/home.png");
const buttonBg = require("../assets/2.0/model/button.png");
const weekBg = require("../assets/2.0/path/week.png");

const ZIGZAG = [0.5, 0.35, 0.25, 0.35, 0.5, 0.65, 0.75, 0.65];
const VGAP = 85;
const CHAPTER_EXTRA_GAP = 40;
const CAT_LESSON_INDEX = 2;

function buildPositions() {
  const positions: number[] = [];
  let y = 20;
  for (let i = 0; i < HDA_LESSONS.length; i++) {
    if (i > 0 && HDA_LESSONS[i].chapter !== HDA_LESSONS[i - 1].chapter) {
      y += CHAPTER_EXTRA_GAP;
    }
    positions.push(y);
    y += VGAP;
  }
  return positions;
}

function getDividerY(index: number, positions: number[]) {
  return positions[index] - CHAPTER_EXTRA_GAP / 2 - 10;
}

export default function HDAPath() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [currentWeek, setCurrentWeek] = useState(HDA_LESSONS[0].week);
  const [currentChapter, setCurrentChapter] = useState(HDA_LESSONS[0].chapter);
  const [currentChapterTitle, setCurrentChapterTitle] = useState(
    HDA_LESSONS[0].chapterTitle,
  );
  const [currentChapterColor, setCurrentChapterColor] = useState(
    HDA_LESSONS[0].chapterColor,
  );

  const router = useRouter();
  // Positions ek j vaar calculate thay — useMemo thi cache
  const POSITIONS = useMemo(() => buildPositions(), []);
  const TOTAL_HEIGHT = POSITIONS[POSITIONS.length - 1] + 200;
  const lastPressTime = useRef(0);

  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => setVisibleCount(HDA_LESSONS.length), 300);
    return () => clearTimeout(timer);
  }, []);

  const openLesson = (lesson: Lesson) => {
    const now = Date.now();
    if (now - lastPressTime.current < 500) return; // debounce 500ms
    lastPressTime.current = now;
    setSelected(lesson);
    setSheetOpen(true);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    let activeChapterIndex = 0;
    for (let i = 1; i < HDA_LESSONS.length; i++) {
      const isChapterStart =
        HDA_LESSONS[i].chapter !== HDA_LESSONS[i - 1].chapter;
      if (isChapterStart) {
        const dividerY = getDividerY(i, POSITIONS) + 60;
        if (scrollY >= dividerY) {
          activeChapterIndex = i;
        }
      }
    }
    setCurrentWeek(HDA_LESSONS[activeChapterIndex].week);
    setCurrentChapter(HDA_LESSONS[activeChapterIndex].chapter);
    setCurrentChapterTitle(HDA_LESSONS[activeChapterIndex].chapterTitle);
    setCurrentChapterColor(HDA_LESSONS[activeChapterIndex].chapterColor);
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Top Chapter Header */}
          <LinearGradient
            colors={[currentChapterColor, "#323232"]}
            start={{ x: 0, y: -1 }}
            end={{ x: 0, y: 1 }}
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              marginBottom: 4,
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: "200",
                  marginBottom: 3,
                }}
              >
                {currentChapter}
              </Text>
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}
              >
                {currentChapterTitle}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 2,
                  height: 32,
                  backgroundColor: "#FFFFFF",
                  marginRight: 12,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  router.push("/phases" as any);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <L1 />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Week label + ScrollView wrapper */}
          <View style={{ flex: 1 }}>
            {/* Week pill */}
            <ImageBackground
              source={weekBg}
              resizeMode="stretch"
              style={{
                position: "absolute",
                top: 8,
                left: 16,
                height: 38,
                width: 72,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
              imageStyle={{ borderRadius: 20 }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}
              >
                Week {currentWeek}
              </Text>
            </ImageBackground>

            {/* Scrollable Path */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{
                height: TOTAL_HEIGHT,
                paddingTop: 60,
                paddingBottom: 80,
              }}
            >
              {HDA_LESSONS.slice(0, visibleCount).map((lesson, index) => {
                const xFrac = ZIGZAG[index % ZIGZAG.length];
                const xPos = (W - 97) * xFrac;
                const yPos = POSITIONS[index];
                const prevChapter =
                  index === 0 ? null : HDA_LESSONS[index - 1].chapter;
                const showChapter =
                  prevChapter !== lesson.chapter && index !== 0;
                const catXPos =
                  (W - 97) * ZIGZAG[CAT_LESSON_INDEX % ZIGZAG.length];
                const catYPos = POSITIONS[CAT_LESSON_INDEX];

                return (
                  <View key={lesson.id}>
                    {/* Chapter Divider */}
                    {showChapter && (
                      <View
                        style={{
                          position: "absolute",
                          top: getDividerY(index, POSITIONS),
                          left: 0,
                          right: 0,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 24,
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 1,
                            backgroundColor: "#FFFFFF",
                          }}
                        />
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontSize: 11,
                            fontWeight: "500",
                            letterSpacing: 0.5,
                          }}
                        >
                          {lesson.chapterTitle}
                        </Text>
                        <View
                          style={{
                            width: 40,
                            height: 1,
                            backgroundColor: "#FFFFFF",
                          }}
                        />
                      </View>
                    )}

                    {/* Path Button */}
                    <View
                      style={{
                        position: "absolute",
                        top: yPos,
                        left: xPos,
                        zIndex: 10,
                      }}
                    >
                      <PathButton
                        icon={lesson.icon}
                        onPress={() => openLesson(lesson)}
                      />
                    </View>

                    {/* Cat Button */}
                    {index === CAT_LESSON_INDEX && (
                      <View
                        style={{
                          position: "absolute",
                          top: catYPos - 10,
                          left: catXPos + 110,
                        }}
                      >
                        <CatButton onPress={() => {}} />
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <AppBottomSheet
        isVisible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        enableDynamicSizing
      >
        {selected && (
          <View
            style={{ paddingHorizontal: 8, paddingTop: 4, paddingBottom: 16 }}
          >
            <View style={{ alignSelf: "flex-start", marginBottom: 20 }}>
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                <Image
                  source={selected.modelIcon ?? selected.icon}
                  style={{ width: 34, height: 34 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: "600",
                textAlign: "left",
                marginBottom: 16,
                letterSpacing: 0.2,
              }}
            >
              {selected.title}
            </Text>

            <View style={{ marginBottom: 32, gap: 12 }}>
              {selected.bullets.map((bulletText, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{ color: "#545456", fontSize: 13, marginTop: -1 }}
                  >
                    •
                  </Text>
                  <Text
                    style={{
                      color: "#8E8E93",
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 18,
                      fontWeight: "400",
                    }}
                  >
                    {bulletText}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setSheetOpen(false);
              }}
              activeOpacity={0.85}
            >
              <ImageBackground
                source={buttonBg}
                style={{
                  width: "100%",
                  height: 56,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  overflow: "hidden",
                }}
                imageStyle={{ borderRadius: 18 }}
                resizeMode="cover"
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 17,
                    fontWeight: "600",
                    letterSpacing: 0.3,
                  }}
                >
                  Continue
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}
      </AppBottomSheet>
    </View>
  );
}
