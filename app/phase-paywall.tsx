import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import X from "../assets/2.0/paywell/CROSS.svg";
import L from "../assets/2.0/paywell/LOCK.svg";
import { PHASES_DATA } from "../constants/phasesData";

const homeBg = require("../assets/photo/login/2.0/home.png");

// ── Plan Card ─────────────────────────────────────────
type PlanCardProps = {
  title: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
};

const buttonBg = require("../assets/2.0/paywell/buttonbg.png");

const PlanCard = ({ title, subtitle, isSelected, onPress }: PlanCardProps) => (
  <View
    style={[
      styles.cardWrapper,
      {
        borderColor: isSelected ? "#ffffff" : "transparent",
        borderWidth: isSelected ? 1 : 2,
      },
    ]}
  >
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardInner}
      onPress={onPress}
    >
      <ImageBackground
        source={buttonBg}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {isSelected && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(150)}
          style={styles.checkBadge}
        >
          <Check size={10} color="#1a1a1a" strokeWidth={5} />
        </Animated.View>
      )}
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planSub}>{subtitle}</Text>
    </TouchableOpacity>
  </View>
);

// ── Feature Row ───────────────────────────────────────
const FeatureRow = ({ text }: { text: string }) => (
  <View style={styles.featureRow}>
    <View style={styles.lockIcon}>
      <L />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────
export default function PhasePaywallScreen() {
  const router = useRouter();
  const { phaseId } = useLocalSearchParams<{ phaseId: string }>();
  const phase =
    PHASES_DATA.find((p) => p.id === Number(phaseId)) ?? PHASES_DATA[0];
  const [selected, setSelected] = useState<"skills" | "company">("skills");

  const isSkills = selected === "skills";

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeBtn}
            >
              <X height={40} width={40} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text style={styles.title}>{phase.title}</Text>
            <Text style={styles.subtitle}>
              Skills you will learn and assets you will build for your company
            </Text>

            {/* Feature list — ZoomIn/Out animation on tab switch */}
            <Animated.View
              key={selected}
              entering={ZoomIn.springify().damping(85).stiffness(800)}
              exiting={ZoomOut.springify().damping(85).stiffness(800)}
              layout={LinearTransition.springify().damping(85).stiffness(1000)}
              style={[
                styles.featureCard,
                { transformOrigin: "50% 100%" } as any,
              ]}
            >
              {(isSkills ? phase.skills : phase.company).map((item, i) => (
                <View key={i}>
                  <FeatureRow text={item} />
                  {i < (isSkills ? phase.skills : phase.company).length - 1 && (
                    <View style={styles.featureDivider} />
                  )}
                </View>
              ))}
            </Animated.View>
          </ScrollView>

          {/* Bottom — Plan cards + CTA */}
          <View style={styles.bottomSection}>
            {/* Plan Cards */}
            <View style={styles.planRow}>
              <PlanCard
                title="Skills"
                subtitle="What you will learn"
                isSelected={isSkills}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelected("skills");
                }}
              />
              <PlanCard
                title="Company"
                subtitle="What you will build"
                isSelected={!isSkills}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelected("company");
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },
  subtitle: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 4,
  },
  lockIcon: { marginTop: 1 },
  featureText: { color: "#FFFFFF", fontSize: 14, flex: 1, lineHeight: 20 },
  featureDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 8,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 8 : 16,
  },
  planRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  cardWrapper: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    borderCurve: "continuous",
  },
  cardInner: {
    padding: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    minHeight: 80,
    borderCurve: "continuous",
    backgroundColor:
      Platform.OS === "android"
        ? "rgba(40,40,40,0.95)"
        : "rgba(255,255,255,0.07)",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  planTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  planSub: { color: "#666666", fontSize: 12 },
});
