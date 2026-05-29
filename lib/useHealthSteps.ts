/**
 * useHealthSteps — iOS pe HealthKit, Android pe null return kare
 * Hooks rules follow kare — conditionally hooks call nathi thata
 */
import { Platform } from "react-native";
import {
  useHealthkitAuthorization,
  useStatisticsForQuantity,
} from "@kingstinct/react-native-healthkit";

// iOS wrapper
function useHealthStepsIOS() {
  const [, requestAuthorization] = useHealthkitAuthorization({
    toRead: ["HKQuantityTypeIdentifierStepCount"],
  });
  const stepStats = useStatisticsForQuantity(
    "HKQuantityTypeIdentifierStepCount",
    ["cumulativeSum"],
    new Date(new Date().setHours(0, 0, 0, 0)),
    new Date(),
  );
  return { requestAuthorization, stepStats };
}

// Android wrapper — koi HealthKit call nahi
function useHealthStepsAndroid() {
  return { requestAuthorization: async () => {}, stepStats: null };
}

export const useHealthSteps =
  Platform.OS === "ios" ? useHealthStepsIOS : useHealthStepsAndroid;
