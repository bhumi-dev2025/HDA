import { DailyData } from '../types';
import { supabase } from './supabase';

// UTC ni bajaye local date use karo (India IST fix)
function getLocalDateStr(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// --- NEW 6-ELEMENT SCORING ALGORITHM ---
const calculateScore = (data: DailyData) => {
  
  // 1. Define Targets (Goals)
  const TARGETS = {
    sleep: 8,          // 8 Hours
    workout: 45,       // 45 Minutes (NEW)
    steps: 8000,       // 8,000 Steps (Adjusted slightly)
    water: 3.5,        // 3.5 Liters
    meditation: 20,    // 20 Minutes (More realistic daily goal)
  };

  // 2. Define Weights (Max Points) - Total 100
  const WEIGHTS = {
    sleep: 20,         // Max 20 pts
    workout: 20,       // Max 20 pts (NEW)
    todo: 20,          // Max 20 pts
    water: 15,         // Max 15 pts
    meditation: 15,    // Max 15 pts
    steps: 10,         // Max 10 pts
  };

  // --- CALCULATION LOGIC ---

  // A. Sleep Score (20 Pts)
  let sleepScore = 0;
  if (data.sleep && data.sleep.hour) {
    const h = parseInt(data.sleep.hour) || 0;
    const m = parseInt(data.sleep.minute) || 0;
    const totalHours = h + (m / 60);
    sleepScore = (Math.min(totalHours, TARGETS.sleep) / TARGETS.sleep) * WEIGHTS.sleep;
  }

  // B. Workout Score (20 Pts) - NEW
  let workoutScore = 0;
  if (data.workout && data.workout.hour) {
    const h = parseInt(data.workout.hour) || 0;
    const m = parseInt(data.workout.minute) || 0;
    const totalMins = (h * 60) + m; // Total minutes count karya
    // Formula: (UserMins / 45) * 20
    workoutScore = (Math.min(totalMins, TARGETS.workout) / TARGETS.workout) * WEIGHTS.workout;
  }

  // C. Meditation Score (15 Pts)
  let meditationScore = 0;
  if (data.meditation) {
    // String mathi number (e.g., "10m" -> 10)
    const mins = parseInt(data.meditation) || 0; 
    meditationScore = (Math.min(mins, TARGETS.meditation) / TARGETS.meditation) * WEIGHTS.meditation;
  }

  // D. Water Score (15 Pts)
  let waterScore = 0;
  if (data.water) {
    waterScore = (Math.min(data.water, TARGETS.water) / TARGETS.water) * WEIGHTS.water;
  }

  // E. Steps Score (10 Pts)
  let stepsScore = 0;
  if (data.steps) {
    const stepCount = parseInt(data.steps) || 0;
    stepsScore = (Math.min(stepCount, TARGETS.steps) / TARGETS.steps) * WEIGHTS.steps;
  }

  // F. To-Do Score (20 Pts)
  let todoScore = 0;
  if (data.todos && data.todos.length > 0) {
    const realTasks = data.todos.filter(t => t.text?.trim() !== '');
    const total = realTasks.length;
    const completed = realTasks.filter(t => t.isDone).length;
    // Formula: (% Completed) * 20
    if (total > 0) todoScore = (completed / total) * WEIGHTS.todo;
  }

  // Final Sum
  const totalScore = sleepScore + workoutScore + meditationScore + waterScore + stepsScore + todoScore;

  // Round off (e.g., 67.8 -> 68)
  return Math.round(totalScore);
};

// --- SAVE DATA TO SUPABASE ---
export const updateDailyLog = async (type: string, value: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const today = getLocalDateStr();

    // 1. Fetch existing data
    const { data: currentData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    // 2. Prepare Updates
    let updates: any = { 
      user_id: user.id, 
      date: today,
    };

    if (currentData) {
        updates = { ...currentData };
    }

    // updated_at LAST ma set karo — currentData spread pachi — nahi toh overwrite thay
    updates.updated_at = new Date();

    // 3. Navi value update karo
    if (type === 'meditation') updates.meditation_time = value;
    if (type === 'water') updates.water_intake = value;
    if (type === 'step') updates.step_count = parseInt(value);
    if (type === 'sleep') updates.sleep_data = value;
    if (type === 'todo') updates.todo_list = value;
    
    // --- WORKOUT UPDATE ADDED ---
    if (type === 'workout') updates.workout_time = value; 

    // 4. Score farithi calculate karo (NEW DATA PASSED HERE)
    const scoreData: DailyData = {
        meditation: updates.meditation_time,
        water: updates.water_intake,
        steps: updates.step_count ? updates.step_count.toString() : '0',
        sleep: updates.sleep_data,
        todos: updates.todo_list,
        workout: updates.workout_time // <--- AA KHUBAJ JARURI CHE
    };
    
    updates.score = calculateScore(scoreData);

    // 5. Database ma Save karo
    const { error } = await supabase
      .from('daily_logs')
      .upsert(updates, { onConflict: 'user_id, date' });

    if (error) throw error;

    return { success: true, newScore: updates.score };

  } catch (error) {
    console.error("Error updating log:", error);
    return { success: false };
  }
};

// --- FETCH WEEKLY SCORES (7 days na alag alag score) ---
export const getWeeklyScores = async (): Promise<{ date: string; score: number }[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Aaj thi 6 din pehla — total 7 days
  const days: { date: string; score: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: getLocalDateStr(d), score: 0 });
  }

  const { data } = await supabase
    .from('daily_logs')
    .select('date, score')
    .eq('user_id', user.id)
    .gte('date', days[0].date)
    .lte('date', days[6].date);

  if (data) {
    data.forEach((row: { date: string; score: number }) => {
      const idx = days.findIndex(d => d.date === row.date);
      if (idx !== -1) days[idx].score = row.score ?? 0;
    });
  }

  return days;
};

// --- FETCH DATA ---
export const getTodayLog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const today = getLocalDateStr();

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
      
    if (error && error.code !== 'PGRST116') {
        console.log("Error fetching:", error);
    }
    return data;
}