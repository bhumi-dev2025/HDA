import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

import I01 from '../../assets/photo/home/I01.svg';
import I02 from '../../assets/photo/home/I02.svg';
import I03 from '../../assets/photo/home/I03.svg';
import I04 from '../../assets/photo/home/I04.svg';
import I1 from '../../assets/photo/home/I1.svg';
import I2 from '../../assets/photo/home/I2.svg';
import I3 from '../../assets/photo/home/I3.svg';
import I4 from '../../assets/photo/home/I4.svg';
export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 20,
            right: 20,
            height: 90,
            borderRadius: 0,
            backgroundColor: "#f1f1f1",
            elevation: 0,
            borderTopWidth: 0,
            paddingTop: 18,
          }
        }}
      >
        {/* Tab 1: Home */}
        <Tabs.Screen
          name="home"
          options={{
            tabBarItemStyle: { flex: 1 },
            tabBarIcon: ({ focused }) => (
              <View className={`items-center justify-center w-14 h-10 rounded-3xl ${focused ? 'bg-white shadow-sm' : ''}`}>
                {focused ? <I01 width={24} height={24} /> : <I1 width={24} height={24} />}
              </View>
            ),
          }}
        />

        {/* Tab 2: Web */}
        <Tabs.Screen
          name="web"
          options={{
            tabBarItemStyle: { width: 60, flex: 0 },
            tabBarIcon: ({ focused }) => (
              <View className={`items-center justify-center w-14 h-10 rounded-3xl ${focused ? 'bg-white shadow-sm' : ''}`}>
                {focused ? <I02 width={24} height={24} /> : <I2 width={24} height={24} />}
              </View>
            ),
          }}
        />

        {/* Tab 3: Explore */}
        <Tabs.Screen
          name="explore"
          options={{
            headerShown: false,
            tabBarItemStyle: { width: 60, flex: 0 },
            tabBarIcon: ({ focused }) => (
              <View className={`items-center justify-center w-14 h-10 rounded-3xl ${focused ? 'bg-white shadow-sm' : ''}`}>
                {focused ? <I03 width={24} height={24} /> : <I3 width={24} height={24} />}
              </View>
            ),
          }}
        />

        {/* Tab 4: Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            tabBarItemStyle: { flex: 1 },
            tabBarIcon: ({ focused }) => (
              <View className={`items-center justify-center w-14 h-10 rounded-3xl ${focused ? 'bg-white shadow-sm' : ''}`}>
                {focused ? <I04 width={24} height={24} /> : <I4 width={24} height={24} />}
              </View>
            ),
          }}
        />

        {/* Tab 5: Chat — Tab Bar માંથી hide */}
        <Tabs.Screen
          name="chat"
          options={{
            href: null, // Tab Bar માંથી સંપૂર્ણ remove
          }}
        />
      </Tabs>

    </View>
  );
}
