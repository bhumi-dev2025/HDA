import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { FC } from "react";
import { ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabButton } from "./tab-button";

import ALUMNI from "../assets/2.0/home icon/ALUMNI.svg";
import HDA from "../assets/2.0/home icon/HDA.svg";
import HOME from "../assets/2.0/home icon/HOME.svg";
import PROFILE from "../assets/2.0/home icon/PROFILE.svg";
import AI from "../assets/2.0/home icon/ai.svg";

const TAB_BG = require("../assets/2.0/home bg/t2.png");
const CIRCLE_BG = require("../assets/2.0/home bg/t1.png");

export enum Tab {
  Home = "home",
  Web = "web",
  Explore = "explore",
  Profile = "profile",
}

export const CustomTabBar: FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  const isTabFocused = (routeName: string) => {
    const index = state.routes.findIndex((route) => route.name === routeName);
    return state.index === index;
  };

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 12 }]}>
      {/* Main Tab Pill */}
      <ImageBackground
        source={TAB_BG}
        style={styles.container}
        imageStyle={{ borderRadius: 999 }}
      >
        <TabButton
          focused={isTabFocused(Tab.Home)}
          onPress={() => navigation.navigate(Tab.Home)}
          label="Home"
        >
          <HOME width={22} height={22} />
        </TabButton>

        <TabButton
          focused={isTabFocused(Tab.Web)}
          onPress={() => navigation.navigate(Tab.Web)}
          label="  HDA  "
        >
          <HDA width={22} height={22} />
        </TabButton>

        <TabButton
          focused={isTabFocused(Tab.Explore)}
          onPress={() => navigation.navigate(Tab.Explore)}
          label="Alumni"
        >
          <ALUMNI width={22} height={22} />
        </TabButton>

        <TabButton
          focused={isTabFocused(Tab.Profile)}
          onPress={() => navigation.navigate(Tab.Profile)}
          label="Profile"
        >
          <PROFILE width={22} height={22} />
        </TabButton>
      </ImageBackground>

      {/* AI Circle Button */}
      <TouchableOpacity style={styles.plusButton} activeOpacity={0.8}>
        <ImageBackground
          source={CIRCLE_BG}
          style={styles.plusButtonBg}
          imageStyle={{ borderRadius: 999 }}
        >
          <AI width={40} height={40} />
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  plusButton: {
    width: 75,
    height: 75,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  plusButtonBg: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: "white",
    fontSize: 40,
    fontWeight: "500",
    lineHeight: 28,
  },
});
