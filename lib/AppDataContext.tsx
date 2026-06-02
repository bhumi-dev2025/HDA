import React, { createContext, useContext, useRef, useState } from "react";
import { getTodayLog, getWeeklyScores } from "./TrackerService";
import { getUserSkills } from "./SkillService";
import { getUserPortfolios, PortfolioItem } from "./PortfolioService";
import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  username: string;
  avatarUrl: string | null;
}

interface AppData {
  todayLog: any | null;
  weeklyScores: { date: string; score: number }[];
  userProfile: UserProfile;
  skillIds: string[];
  portfolios: PortfolioItem[];
  exploreLinks: any[];
  exploreCollections: any[];
}

interface AppDataContextType {
  data: AppData;
  isReady: boolean;
  preloadAll: () => Promise<void>;
  refreshTodayLog: () => Promise<void>;
  refreshExplore: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultData: AppData = {
  todayLog: null,
  weeklyScores: [],
  userProfile: { username: "Loading...", avatarUrl: null },
  skillIds: [],
  portfolios: [],
  exploreLinks: [],
  exploreCollections: [],
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppDataContext = createContext<AppDataContextType>({
  data: defaultData,
  isReady: false,
  preloadAll: async () => {},
  refreshTodayLog: async () => {},
  refreshExplore: async () => {},
  refreshProfile: async () => {},
  setData: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [isReady, setIsReady] = useState(false);
  const loadedRef = useRef(false);

  // Splash time e ek j vaar badhu load karo
  const preloadAll = async () => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    try {
      const [
        todayLog,
        weeklyScores,
        skillIds,
        portfolios,
        linksRes,
        collectionsRes,
        userRes,
      ] = await Promise.allSettled([
        getTodayLog(),
        getWeeklyScores(),
        getUserSkills(),
        getUserPortfolios(),
        supabase.from("links").select("*").order("created_at", { ascending: false }),
        supabase.from("collections").select("*").order("created_at", { ascending: false }),
        supabase.auth.getUser(),
      ]);

      let userProfile: UserProfile = { username: "Academy User", avatarUrl: null };
      if (userRes.status === "fulfilled") {
        const user = userRes.value.data?.user;
        if (user) {
          userProfile = {
            username: user.user_metadata?.full_name || user.email?.split("@")[0] || "Academy User",
            avatarUrl: user.user_metadata?.avatar_url || null,
          };
        }
      }

      setData({
        todayLog: todayLog.status === "fulfilled" ? todayLog.value : null,
        weeklyScores: weeklyScores.status === "fulfilled" ? weeklyScores.value : [],
        skillIds: skillIds.status === "fulfilled" ? skillIds.value : [],
        portfolios: portfolios.status === "fulfilled" ? portfolios.value : [],
        exploreLinks: linksRes.status === "fulfilled" ? (linksRes.value.data || []) : [],
        exploreCollections: collectionsRes.status === "fulfilled" ? (collectionsRes.value.data || []) : [],
        userProfile,
      });
    } catch (e) {
      console.error("AppDataContext preload error:", e);
    } finally {
      setIsReady(true);
    }
  };

  const refreshTodayLog = async () => {
    const [todayLog, weeklyScores] = await Promise.allSettled([
      getTodayLog(),
      getWeeklyScores(),
    ]);
    setData((prev) => ({
      ...prev,
      todayLog: todayLog.status === "fulfilled" ? todayLog.value : prev.todayLog,
      weeklyScores: weeklyScores.status === "fulfilled" ? weeklyScores.value : prev.weeklyScores,
    }));
  };

  const refreshExplore = async () => {
    const [linksRes, collectionsRes] = await Promise.allSettled([
      supabase.from("links").select("*").order("created_at", { ascending: false }),
      supabase.from("collections").select("*").order("created_at", { ascending: false }),
    ]);
    setData((prev) => ({
      ...prev,
      exploreLinks: linksRes.status === "fulfilled" ? (linksRes.value.data || []) : prev.exploreLinks,
      exploreCollections: collectionsRes.status === "fulfilled" ? (collectionsRes.value.data || []) : prev.exploreCollections,
    }));
  };

  const refreshProfile = async () => {
    const [skillIds, portfolios, userRes] = await Promise.allSettled([
      getUserSkills(),
      getUserPortfolios(),
      supabase.auth.getUser(),
    ]);
    let userProfile = data.userProfile;
    if (userRes.status === "fulfilled") {
      const user = userRes.value.data?.user;
      if (user) {
        userProfile = {
          username: user.user_metadata?.full_name || user.email?.split("@")[0] || "Academy User",
          avatarUrl: user.user_metadata?.avatar_url || null,
        };
      }
    }
    setData((prev) => ({
      ...prev,
      skillIds: skillIds.status === "fulfilled" ? skillIds.value : prev.skillIds,
      portfolios: portfolios.status === "fulfilled" ? portfolios.value : prev.portfolios,
      userProfile,
    }));
  };

  return (
    <AppDataContext.Provider value={{ data, isReady, preloadAll, refreshTodayLog, refreshExplore, refreshProfile, setData }}>
      {children}
    </AppDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData() {
  return useContext(AppDataContext);
}
