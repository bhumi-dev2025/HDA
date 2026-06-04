import { useCallback, useState } from "react";
import { Platform } from "react-native";
import {
  useHealthkitAuthorization,
  queryStatisticsForQuantity,
} from "@kingstinct/react-native-healthkit";

function useHealthStepsIOS() {
  const [steps, setSteps] = useState<number | null>(null);

  const [, requestAuthorizationRaw] = useHealthkitAuthorization({
    toRead: ["HKQuantityTypeIdentifierStepCount"],
  });

  const fetchSteps = useCallback(async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const res = await queryStatisticsForQuantity(
        "HKQuantityTypeIdentifierStepCount",
        ["cumulativeSum"],
        { filter: { date: { startDate: startOfDay, endDate: now } } },
      );

      const qty = res?.sumQuantity;
      const count = Math.round(
        typeof qty === "number" ? qty : ((qty as any)?.quantity ?? 0),
      );
      setSteps(count > 0 ? count : null);
    } catch {
      // permission nathi — ignore
    }
  }, []);

  const requestAuthorization = useCallback(async () => {
    try {
      await requestAuthorizationRaw();
      await fetchSteps();
    } catch {
      // denied — ignore
    }
  }, [requestAuthorizationRaw, fetchSteps]);

  const stepStats = steps !== null ? { sumQuantity: steps } : null;

  return { requestAuthorization, stepStats };
}

function useHealthStepsAndroid() {
  return { requestAuthorization: async () => {}, stepStats: null };
}

export const useHealthSteps =
  Platform.OS === "ios" ? useHealthStepsIOS : useHealthStepsAndroid;