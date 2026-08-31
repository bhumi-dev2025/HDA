// Android — Google Health Connect (replaces old Google Fit REST API service)
import {
  initialize,
  requestPermission,
  getSdkStatus,
  SdkAvailabilityStatus,
  readRecords,
} from "react-native-health-connect";

let isInitialized = false;

/**
 * Health Connect ready che ke nahi check kare — na hoy to initialize + permission mangi le.
 * Returns false if Health Connect app j device par nathi, ke permission na malyu.
 */
export const ensureHealthConnectReady = async (): Promise<boolean> => {
  try {
    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      // Health Connect app device par installed nathi (ke update jarurii che)
      return false;
    }

    if (!isInitialized) {
      const ok = await initialize();
      if (!ok) return false;
      isInitialized = true;
    }

    const granted = await requestPermission([
      { accessType: "read", recordType: "Steps" },
    ]);

    return granted.some(
      (p) => p.recordType === "Steps" && p.accessType === "read",
    );
  } catch (error) {
    console.log("HealthConnect init/permission error:", error);
    return false;
  }
};

/**
 * Aaje (midnight thi ahiya sudhi) na total steps Health Connect mathi fetch kare.
 * Returns null if data na male ke error aave.
 */
export const fetchHealthConnectSteps = async (): Promise<number | null> => {
  try {
    const ready = await ensureHealthConnectReady();
    if (!ready) return null;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    const result = await readRecords("Steps", {
      timeRangeFilter: {
        operator: "between",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
    });

    const records = result?.records ?? [];
    if (!records.length) return null;

    const GOOGLE_FIT_SOURCE = "com.google.android.apps.fitness";

    const googleFitRecords = records.filter(
      (r: any) => r.metadata?.dataOrigin === GOOGLE_FIT_SOURCE,
    );

    const recordsToSum = googleFitRecords.length ? googleFitRecords : records;

    const totalSteps = recordsToSum.reduce(
      (sum: number, r: any) => sum + (r.count ?? 0),
      0,
    );

    return totalSteps > 0 ? totalSteps : null;
  } catch (error) {
    console.log("HealthConnect fetch steps error:", error);
    return null;
  }
};
