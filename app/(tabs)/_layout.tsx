import { Tabs } from "expo-router";
import { View } from "react-native";
// import { Ionicons, Fontisto,FontAwesome5 } from "@expo/vector-icons";

import I1 from '../../assets/photo/home/I1.svg'
import I2 from '../../assets/photo/home/I2.svg'
import I3 from '../../assets/photo/home/I3.svg'
import I4 from '../../assets/photo/home/I4.svg'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // નામ છુપાવો

        // --- Floating Tab Bar Styling ---
        tabBarStyle: {
          position: "absolute",
          bottom: 25,         // નીચેથી ઉપર
          left: 20,           // ડાબી બાજુ માર્જિન
          right: 20,          // જમણી બાજુ માર્જિન
          height: 70,         // ટેબ બારની ઊંચાઈ
          borderRadius: 40,   // ગોળ ખૂણા
          backgroundColor: "#F1F1F1", // બેકગ્રાઉન્ડ કલર (પેજ જેવો જ)
          // Shadow/Elevation (Figma જેવો લુક આપવા)
          elevation: 0,       // એન્ડ્રોઈડ પર શેડો કાઢવા માટે (જો જોઈએ તો નંબર વધારો)
          borderTopWidth: 0,  // ઉપરની લાઈન કાઢવા
        },
      }}
    >
      {/* Tab 1: Home (Active State Customization) */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarItemStyle: { marginRight: 'auto' },
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-16 h-12 rounded-full ${focused ? 'bg-white shadow-sm elevation-2' : ''}`}>
              <I1 width={24} height={24} fill={focused ? 'black' : 'grey'} />
            </View>
          ),
        }}
      />

      {/* Tab 2: Rocket (Placeholder) */}
      <Tabs.Screen
        name="explore" // તમારી ફાઈલનું નામ
        options={{
          headerShown: false,
          tabBarItemStyle: { marginHorizontal: -30 },
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-16 h-12 rounded-full ${focused ? 'bg-white shadow-sm' : ''}`}>
              <I3 width={24} height={24} fill={focused ? 'black' : 'grey'} />
            </View>
          ),
        }}
      />

      {/* Tab 3: Ghost (Placeholder) */}
      <Tabs.Screen
        name="web" // તમારી ફાઈલનું નામ
        options={{
          tabBarItemStyle: { marginHorizontal: -30 },
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-16 h-12 rounded-full ${focused ? 'bg-white shadow-sm' : ''}`}>
              <I2 width={24} height={24} fill={focused ? 'black' : 'grey'} />
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
            <View className={`items-center justify-center w-16 h-12 rounded-full ${focused ? 'bg-white shadow-sm' : ''}`}>
              <I4 width={24} height={24} fill={focused ? 'black' : 'grey'} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}