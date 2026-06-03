/**
 * useHealthSteps — iOS pe HealthKit, Android pe null return kare
 */
import { useState } from "react";
import { Platform } from "react-native";
import {
  useHealthkitAuthorization,
  useStatisticsForQuantity,
} from "@kingstinct/react-native-healthkit";

function useHealthStepsIOS() {
  const [authorized, setAuthorized] = useState(false);

  const [, requestAuthorizationRaw] = useHealthkitAuthorization({
    toRead: ["HKQuantityTypeIdentifierStepCount"],
  });

  const requestAuthorization = async () => {
    try {
      const result = await requestAuthorizationRaw();
      setAuthorized(true);
      return result;
    } catch (e) {
      // permission denied — silently ignore
    }
  };

  // authorized hoy tyare j stats fetch karo
  const stepStats = useStatisticsForQuantity(
    "HKQuantityTypeIdentifierStepCount",
    ["cumulativeSum"],
    new Date(new Date().setHours(0, 0, 0, 0)),
    new Date(),
  );

  return { requestAuthorization, stepStats: authorized ? stepStats : null };
}

function useHealthStepsAndroid() {
  return { requestAuthorization: async () => {}, stepStats: null };
}

export const useHealthSteps =
  Platform.OS === "ios" ? useHealthStepsIOS : useHealthStepsAndroid;
