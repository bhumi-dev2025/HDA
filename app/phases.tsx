import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import X from "../assets/2.0/paywell/CROSS.svg";
import { PHASES_DATA } from "../constants/phasesData";
const homeBg = require("../assets/photo/login/2.0/home.png");
const catIcon = require("../assets/2.0/paywell/active.png");
const phaseBg = require("../assets/2.0/paywell/phasebg.png");

export default function PhasesScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeBtn}
            >
              <X height={40} width={40} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Phases</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {PHASES_DATA.map((phase) => (
              <TouchableOpacity
                key={phase.id}
                activeOpacity={0.75}
                style={styles.card}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push({
                    pathname: "/phase-paywall",
                    params: { phaseId: phase.id },
                  } as any);
                }}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <Text style={{ color: "#ffffff", fontSize: 14 }}>•</Text>
                      <Text style={styles.bulletText}>
                        {phase.phasedescription}
                      </Text>
                    </View>
                  </View>
                  <Image
                    source={catIcon}
                    style={styles.catIcon}
                    resizeMode="contain"
                  />
                </View>
                <ImageBackground
                  source={phaseBg}
                  style={styles.cardTitleSection}
                  resizeMode="cover"
                  imageStyle={{
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20,
                  }}
                >
                  <Text style={styles.cardTitle}>{phase.subtitle}</Text>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  closeBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 20 },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  bulletText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
    fontWeight: "400",
    opacity: 0.8,
  },
  catIcon: { width: 80, height: 80, top: 20, left: 20 },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  cardTitleSection: {
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    overflow: "hidden",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
