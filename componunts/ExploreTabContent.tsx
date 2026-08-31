import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface ExploreTabContentProps {
  activeTabTitle: string;
}

// Ported from: D:\DEVMODE\make it animated\shopifytab\components\tab-content.tsx
// Placeholder content per tab — wire up real data later.
export const ExploreTabContent: React.FC<ExploreTabContentProps> = ({
  activeTabTitle,
}) => {
  return (
    <View className="mb-6">
      <Animated.View
        key={activeTabTitle}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(100)}
        className="items-center justify-center py-10 rounded-2xl"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text className="text-xl font-bold text-white mb-1">
          {activeTabTitle} Page
        </Text>
        <Text className="text-zinc-400 text-center">{activeTabTitle}</Text>
      </Animated.View>
    </View>
  );
};
