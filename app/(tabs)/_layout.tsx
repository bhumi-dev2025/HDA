import { Tabs } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";
import { CustomTabBar } from "../../componunts/custom-tab-bar";
import FloatingChatButton, { FloatingChatButtonHandle } from "../../componunts/FloatingChatButton";

export default function TabLayout() {
  const chatRef = useRef<FloatingChatButtonHandle>(null);
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="web" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <FloatingChatButton ref={chatRef} />
    </View>
  );
}