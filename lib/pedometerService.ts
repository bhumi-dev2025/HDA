import { Pedometer } from 'expo-sensors';
import { fetchGoogleFitSteps } from './googleFitService';

export const fetchTodaySteps = async (): Promise<number | null> => {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();

    if (isAvailable) {
      // ✅ Primary: expo-sensors Pedometer
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(start, end);
      console.log('Steps via Pedometer:', result?.steps);
      return result?.steps ?? null;

    } else {
      // ❌ Fallback: Google Fit
      console.log('Pedometer unavailable → trying Google Fit...');
      return await fetchGoogleFitSteps();
    }

  } catch (error) {
    console.log('Pedometer error → falling back to Google Fit:', error);
    return await fetchGoogleFitSteps();
  }
};