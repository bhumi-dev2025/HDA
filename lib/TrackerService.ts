import { supabase } from './supabase';

// 1. Types Update: 'workout' add karyu che
export type DailyData = {
  meditation?: string;
  water?: number;
  steps?: string;
  sleep?: { hour: string; minute: string };
  workout?: { hour: string; minute: string }; // <--- NEW ADDED
  todos?: { text: string; isDone: boolean }[];
};

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
    const total = data.todos.length;
    const completed = data.todos.filter(t => t.isDone).length;
    // Formula: (% Completed) * 20
    todoScore = (completed / total) * WEIGHTS.todo;
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

    const today = new Date().toISOString().split('T')[0];

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
      updated_at: new Date() 
    };

    if (currentData) {
        updates = { ...currentData };
    }

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

// --- FETCH DATA ---
export const getTodayLog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const today = new Date().toISOString().split('T')[0];

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