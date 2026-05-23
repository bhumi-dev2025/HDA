import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Heart, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

// Assets Imports
import A1 from "../../assets/photo/home/A1.svg";
import A2 from "../../assets/photo/home/A2.svg";
import P1 from "../../assets/photo/profile/P1.svg";
import P2 from "../../assets/photo/profile/P2.svg";
import P4 from "../../assets/photo/profile/P4.svg";

// Modal Imports
import { AddPortfolioModal } from "@/componunts/Modals/AddPortfolio";
import { AddExpertiseModal } from "@/componunts/Modals/AddSkils";

// Data & Services
import { MASTER_SKILLS } from "../../constants/skillData";
import {
  deleteUserPortfolio,
  getUserPortfolios,
  PortfolioItem,
  saveUserPortfolio,
} from "../../lib/PortfolioService";
import { getUserSkills, saveUserSkills } from "../../lib/SkillService";

const ProfileScreen = () => {
  const router = useRouter();
  const p1 = require("../../assets/photo/profile/p1.png");
  const pbg = require("../../assets/2.0/profile bg/p1.png");
  const defaultImage =
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop";

  const [username, setUsername] = useState("Loading...");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);

  const [showExpertise, setShowExpertise] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUsername(
          user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Academy User",
        );
        setAvatarUrl(user.user_metadata?.avatar_url || null);

        const savedIds = await getUserSkills();
        setSelectedSkillIds(savedIds);

        const loadedPortfolios = await getUserPortfolios();
        setPortfolios(loadedPortfolios);
      }
    };
    loadData();
  }, []);

  const handleSaveSkills = async (ids: string[]) => {
    setSelectedSkillIds(ids);
    await saveUserSkills(ids);
  };

  const handleSavePortfolio = async (
    link: string,
    title: string,
    image: string,
  ) => {
    try {
      const newItem = await saveUserPortfolio(link, title, image);
      setPortfolios([...portfolios, newItem]);
      setShowPortfolio(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      await deleteUserPortfolio(id);
      setPortfolios(portfolios.filter((item) => item.id !== id));
    } catch (e) {
      console.log("Delete error", e);
    }
  };

  const handleMainLinkPress = async () => {
    if (portfolios.length === 0) {
      setShowPortfolio(true);
      return;
    }

    const linkToCopy = portfolios[0].link;
    await Clipboard.setStringAsync(linkToCopy);

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="dark" />

      {/* Header Image */}
      <View className="relative w-full h-64">
        <Image source={p1} className="w-full h-full object-cover" />
        {/* Wallet + Settings buttons — top right */}
        <View className="absolute top-12 right-5 flex-row items-center gap-2">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-white/80"
            onPress={() => router.push("/wallet")}
          >
            <A2 height={22} width={22} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-white/80"
            onPress={() => router.push("/settings")}
          >
            <A1 height={22} width={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Content Container */}
      <ImageBackground
        source={pbg}
        resizeMode="cover"
        className="rounded-t-[40px] -mt-16 p-4 pt-16 relative flex-1"
        imageStyle={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
      >
        {/* Avatar */}
        <View className="absolute -top-16 left-0 right-0 items-center z-10">
          <View className="p-1 rounded-full border-2 border-dashed border-red-300">
            <View className="p-1 rounded-full">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <Image
                  source={{ uri: defaultImage }}
                  className="w-24 h-24 rounded-full"
                />
              )}
            </View>
          </View>
          <TouchableOpacity className="absolute bottom-[-10px] bg-red-400 p-1 rounded-full">
            <Plus height={10} width={25} color="white" strokeWidth={4} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        >
          {/* User Details */}
          <View className="items-center mt-4 space-y-2">
            <View className="flex-row items-center space-x-2 mb-5">
              <Text className="text-2xl font-bold text-[#FFFFFF]">
                {username}
              </Text>
              <View className="rounded-full p-1">
                <P1 height={20} width={20} />
              </View>
            </View>
            <Text className="text-lg font-semibold text-center text-[#FFFFFF]">
              Will work for humans not for machin
            </Text>
            <TouchableOpacity
              onPress={handleMainLinkPress}
              className={`flex-row items-center space-x-1 mt-1 gap-2 px-3 py-1 rounded-full ${isCopied ? "bg-green-100" : ""}`}
            >
              {isCopied ? <P2 color="green" /> : <P2 />}

              <Text
                className={`${isCopied ? "text-green-600 font-bold" : "text-[#00C3D0] font-medium underline"} text-base`}
              >
                {isCopied
                  ? "Copied!"
                  : portfolios.length > 0
                    ? "Portfolio link"
                    : "Add Portfolio"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* --- EXPERTISE SECTION --- */}
          <View className="mt-8 space-y-4 p-4 mb-2">
            <View className="flex-row items-center space-x-2 gap-2 mb-2">
              <P4 />
              <Text className="text-lg font-bold text-[#FFFFFF]">
                My Expertise
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3 items-center">
              {selectedSkillIds.map((id) => {
                const skill = MASTER_SKILLS.find((s) => s.id === id);
                if (!skill) return null;
                const IconComponent = skill.icon;
                return (
                  <View
                    key={id}
                    className="flex-row items-center bg-[#2B2B2B] h-[44px] px-3 rounded-[8px] border-2 border-[#3F3F3F]"
                    style={styles.customShadow}
                  >
                    {skill.type === "svg" ? (
                      <IconComponent height={18} width={18} />
                    ) : (
                      <IconComponent size={16} color="#AFAFAF" />
                    )}
                    <Text className="ml-2 text-[#FFFFFF] font-medium">
                      {skill.name}
                    </Text>
                  </View>
                );
              })}
              <LinearGradient
                colors={["rgba(255,255,255,0.13)", "rgba(0,0,0,0.13)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                <TouchableOpacity
                  onPress={() => setShowExpertise(true)}
                  className="flex-row items-center bg-[#404040] h-[44px] px-3 rounded-[8px]"
                  style={styles.customShadow}
                >
                  <View className="border border-[#FFFFFF] rounded-full p-0.5 mr-2">
                    <Plus size={10} color="#FFFFFF" />
                  </View>
                  <Text className="text-[#FFFFFF] font-medium">Add Skill</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* --- PORTFOLIO SECTION --- */}
          <View className="space-y-4 p-4">
            <View className="flex-row items-center space-x-2 gap-2 mb-2">
              <P4 />
              <Text className="text-lg font-bold text-[#FFFFFF]">
                Portfolio
              </Text>
            </View>

            <View className="flex-col gap-4">
              {portfolios.map((item) => (
                <View
                  key={item.id}
                  className="w-full bg-[#1C1C1E] rounded-2xl border border-[#3F3F3F] overflow-hidden relative"
                >
                  <TouchableOpacity
                    onPress={() => handleDeletePortfolio(item.id)}
                    className="absolute top-2 right-2 z-10 bg-[#2B2B2B]/90 p-2 rounded-full"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>

                  <Image
                    source={{
                      uri: item.image_url || "https://via.placeholder.com/300",
                    }}
                    className="w-full h-36 bg-[#2B2B2B]"
                    resizeMode="cover"
                  />
                  <View className="p-4 bg-[#19181B]">
                    <Text
                      className="text-white font-bold text-base"
                      numberOfLines={1}
                    >
                      {item.title || "Portfolio Link"}
                    </Text>
                    <Text
                      className="text-[#636366] text-xs mt-1"
                      numberOfLines={1}
                    >
                      {item.link}
                    </Text>
                  </View>
                </View>
              ))}

              {portfolios.length === 0 && (
                <LinearGradient
                  colors={["rgba(255,255,255,0.13)", "rgba(0,0,0,0.13)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.gradientBorderLg, { marginTop: 8 }]}
                >
                  <TouchableOpacity
                    onPress={() => setShowPortfolio(true)}
                    className="flex-row items-center justify-center bg-[#404040] h-[50px] rounded-[12px]"
                    style={styles.customShadow}
                  >
                    <View className="border border-[#FFFFFF] rounded-full p-0.5 mr-2">
                      <Plus size={10} color="#FFFFFF" />
                    </View>
                    <Text className="text-[#FFFFFF] font-medium">
                      Add Portfolio
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          </View>

          {/* Footer */}
          <View className="mt-10 pt-5 pb-10 items-center justify-center space-y-1 bottom-5">
            <Heart size={20} color="#ef4444" fill="#ef4444" />
            <Text className="text-[#FFFFFF] text-xs font-extrabold mt-2">
              Human Design Academy
            </Text>
            <Text className="text-[#FFFFFF] text-[8px] font-extralight">
              Designed by Simple Studio
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Modals */}
      <AddExpertiseModal
        isVisible={showExpertise}
        onClose={() => setShowExpertise(false)}
        onSave={handleSaveSkills}
        initialSelectedSkills={selectedSkillIds}
      />
      <AddPortfolioModal
        isVisible={showPortfolio}
        onClose={() => setShowPortfolio(false)}
        onSave={handleSavePortfolio}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  customShadow: {
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  // ADD THIS:
  gradientBorder: {
    borderRadius: 10,
    padding: 1,
  },
  gradientBorderLg: {
    borderRadius: 14,
    padding: 1,
  },
});
