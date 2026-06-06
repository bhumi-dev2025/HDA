import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { PHASES_DATA } from "../constants/phasesData";

const homeBg = require("../assets/photo/login/2.0/home.png");

export default function PhaseDetailScreen() {
  const router = useRouter();
  const { phaseId, type } = useLocalSearchParams<{ phaseId: string; type: string }>();
  const phase = PHASES_DATA.find((p) => p.id === Number(phaseId)) ?? PHASES_DATA[0];
  const isSkills = type === "skills";
  const items = isSkills ? phase.skills : phase.company;

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              {phase.title}{" "}
              <Text style={styles.titleTag}>({isSkills ? "skills" : "company"})</Text>
            </Text>

            <View style={styles.card}>
              {items.map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "700", textAlign: "center", marginVertical: 24 },
  titleTag: { color: "#8E8E93", fontSize: 18, fontWeight: "400" },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    gap: 16,
  },
  bulletRow: { flexDirection: "row", gap: 10 },
  bulletDot: { color: "#636366", fontSize: 16, marginTop: 1 },
  bulletText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22, flex: 1 },
});