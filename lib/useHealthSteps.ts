import { useCallback, useState } from "react";
import { Platform } from "react-native";
import {
  useHealthkitAuthorization,
  queryStatisticsForQuantity,
} from "@kingstinct/react-native-healthkit";
import { fetchHealthConnectSteps } from "./healthConnectService";

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
      const result = count > 0 ? count : null;
      setSteps(result);
      return result;
    } catch {
      // permission nathi — ignore
      return null;
    }
  }, []);

  const requestAuthorization = useCallback(async () => {
    try {
      await requestAuthorizationRaw();
      return await fetchSteps();
    } catch {
      // denied — ignore
      return null;
    }
  }, [requestAuthorizationRaw, fetchSteps]);

  const stepStats = steps !== null ? { sumQuantity: steps } : null;

  return { requestAuthorization, stepStats };
}

function useHealthStepsAndroid() {
  const [steps, setSteps] = useState<number | null>(null);

  const fetchSteps = useCallback(async () => {
    try {
      const count = await fetchHealthConnectSteps();
      setSteps(count);
      return count;
    } catch {
      // Health Connect na hoy / permission na hoy — ignore
      return null;
    }
  }, []);

  // "requestAuthorization" naam iOS jevu j rakhyu — home.tsx ek j interface vapre
  const requestAuthorization = useCallback(async () => {
    return await fetchSteps();
  }, [fetchSteps]);

  const stepStats = steps !== null ? { sumQuantity: steps } : null;

  return { requestAuthorization, stepStats };
}

export const useHealthSteps =
  Platform.OS === "ios" ? useHealthStepsIOS : useHealthStepsAndroid;
