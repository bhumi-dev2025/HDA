import { Tabs } from "expo-router";
import { View } from "react-native";

import I1 from '../../assets/photo/home/I1.svg'
import I2 from '../../assets/photo/home/I2.svg'
import I3 from '../../assets/photo/home/I3.svg'
import I4 from '../../assets/photo/home/I4.svg'
import I01 from '../../assets/photo/home/I01.svg'
import I02 from '../../assets/photo/home/I02.svg'
import I03 from '../../assets/photo/home/I03.svg'
import I04 from '../../assets/photo/home/I04.svg'


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // નામ છુપાવો
        // --- Floating Tab Bar Styling ---
        tabBarStyle: {
          position: "absolute",
          bottom: 0,         // નીચેથી ઉપર
          left: 20,           // ડાબી બાજુ માર્જિન
          right: 20,          // જમણી બાજુ માર્જિન
          height: 90,         // ટેબ બારની ઊંચાઈ
          borderRadius: 0,   // ગોળ ખૂણા
          backgroundColor: "#F1F1F1", // બેકગ્રાઉન્ડ કલર (પેજ જેવો જ)
          // Shadow/Elevation (Figma જેવો લુક આપવા)
          elevation: 0,       // એન્ડ્રોઈડ પર શેડો કાઢવા માટે (જો જોઈએ તો નંબર વધારો)
          borderTopWidth: 0,  // ઉપરની લાઈન કાઢવા
        },
      }}
    >
      {/* Tab 1: Home (Active State Customization) */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarItemStyle: { marginRight: 'auto' },
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-14 h-10 rounded-3xl ${focused ? 'bg-white shadow-sm' : ''}`}>
              {focused ? <I01 width={24} height={24} /> : <I1 width={24} height={24} />}
            </View>
          ),
        }}
      />

      {/* Tab 2: Ghost (Placeholder) */}
      <Tabs.Screen
        name="web" // તમારી ફાઈલનું નામ
        options={{
          tabBarItemStyle: { marginHorizontal: -30 },
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-14 h-10 rounded-3xl ${focused ? 'bg-white shadow-sm' : ''}`}>
              {focused ? <I02 width={24} height={24} /> : <I2 width={24} height={24} />}
            </View>
          ),
        }}
      />

      {/* Tab 3: Rocket (Placeholder) */}
      <Tabs.Screen
        name="explore" // તમારી ફાઈલનું નામ
        options={{
          headerShown: false,
          tabBarItemStyle: { marginHorizontal: -30 },
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-14 h-10 rounded-3xl ${focused ? 'bg-white shadow-sm' : ''}`}>
              {focused ? <I03 width={24} height={24} /> : <I3 width={24} height={24} />}

            </View>
          ),
        }}
      />

      {/* Tab 4: User (Placeholder) */}
      <Tabs.Screen
        name="profile" // તમારી ફાઈલનું નામ
        options={{
          tabBarItemStyle: { marginLeft: 'auto' },
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-14 h-10 rounded-3xl ${focused ? 'bg-white shadow-sm' : ''}`}>
              {focused ? <I04 width={24} height={24} /> : <I4 width={24} height={24} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}