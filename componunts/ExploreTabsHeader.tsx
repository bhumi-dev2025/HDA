import React, { useRef } from "react";
import { Text, ScrollView, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface ExploreTabsHeaderProps {
  tabs: string[];
  activeTab: number;
  onSelectTab: (index: number) => void;
}

// Ported from: D:\DEVMODE\make it animated\shopifytab\components\scrollable-header.tsx
// Placed below the "stories" row in explore.tsx.
export const ExploreTabsHeader: React.FC<ExploreTabsHeaderProps> = ({
  tabs,
  activeTab,
  onSelectTab,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const handlePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectTab(index);

    scrollViewRef.current?.scrollTo({
      x: index * 100 - 50,
      animated: true,
    });
  };

  return (
    <Animated.View entering={FadeIn.duration(150)} className="pb-3">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;

          return (
            <Pressable
              key={tab}
              onPress={() => handlePress(index)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-white border-white"
                  : "bg-zinc-900 border-zinc-700"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? "text-black" : "text-zinc-400"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};
