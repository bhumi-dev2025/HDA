import { Tabs } from "expo-router";
import { View } from "react-native";
import { CustomTabBar } from "../../componunts/custom-tab-bar";

export default function TabLayout() {
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

        {/* Chat — Tab Bar માંથી hide */}
        <Tabs.Screen
          name="chat"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}