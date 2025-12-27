import { supabase } from './supabase'; // Tamari supabase config file
// Jo tamari file 'lib/supabase.ts' ma hoy to barabar che via path check kari lejo.

// Types define kariye
export type DailyData = {
  meditation?: string;
  water?: number;
  steps?: string;
  sleep?: { hour: string; minute: string };
  todos?: { text: string; isDone: boolean }[];
};

// --- SCORING ALGORITHM (0 - 100) ---
// const calculateScore = (data: DailyData) => {
//   let score = 0;

//   // 1. Meditation (Any time added = 20 pts)
//   if (data.meditation) score += 20;

//   // 2. Water (Goal: 1.5L+)
//   if (data.water && data.water >= 1.5) score += 20;
//   else if (data.water && data.water > 0) score += 10;

//   // 3. Steps (Goal: 2000+)
//   const steps = parseInt(data.steps || '0');
//   if (steps >= 2000) score += 20;
//   else if (steps > 0) score += 10;

//   // 4. Sleep (Any entry = 20 pts)
//   if (data.sleep && data.sleep.hour) score += 20;

//   // 5. Todo (Completion %)
//   if (data.todos && data.todos.length > 0) {
//     const total = data.todos.length;
//     const completed = data.todos.filter(t => t.isDone).length;
//     const percentage = completed / total;
//     score += Math.round(percentage * 20);
//   }

//   return Math.min(score, 100); // Max 100
// };
// --- ADVANCED SCORING ALGORITHM (0 - 100) ---
const calculateScore = (data: DailyData) => {
  // 1. Define Targets & Weights
  const TARGETS = {
    sleep: 8,       // 8 Hours
    steps: 10000,   // 10,000 Steps
    water: 4,       // 4 Liters
    meditation: 60, // 60 Minutes
  };

  const WEIGHTS = {
    sleep: 30,      // Max 30 pts
    todo: 20,       // Max 20 pts
    steps: 20,      // Max 20 pts
    water: 15,      // Max 15 pts
    meditation: 15, // Max 15 pts
  };

  // --- CALCULATION ---

  // 1. Sleep Score (30 Pts)
  // Input format: { hour: "8", minute: "30" } -> Convert to 8.5 hours
  let sleepScore = 0;
  if (data.sleep && data.sleep.hour) {
    const h = parseInt(data.sleep.hour) || 0;
    const m = parseInt(data.sleep.minute) || 0;
    const totalHours = h + (m / 60); // Minutes ne hours ma convert karya
    // Formula: (UserHours / 8) * 30
    sleepScore = (Math.min(totalHours, TARGETS.sleep) / TARGETS.sleep) * WEIGHTS.sleep;
  }

  // 2. Meditation Score (15 Pts)
  // Input format: string like "10" or "10m"
  let meditationScore = 0;
  if (data.meditation) {
    const mins = parseInt(data.meditation) || 0; // String mathi number banavyo
    meditationScore = (Math.min(mins, TARGETS.meditation) / TARGETS.meditation) * WEIGHTS.meditation;
  }

  // 3. Water Score (15 Pts)
  // Input format: number (e.g., 1.5)
  let waterScore = 0;
  if (data.water) {
    waterScore = (Math.min(data.water, TARGETS.water) / TARGETS.water) * WEIGHTS.water;
  }

  // 4. Steps Score (20 Pts)
  // Input format: string (e.g., "2500")
  let stepsScore = 0;
  if (data.steps) {
    const stepCount = parseInt(data.steps) || 0;
    stepsScore = (Math.min(stepCount, TARGETS.steps) / TARGETS.steps) * WEIGHTS.steps;
  }

  // 5. To-Do Score (20 Pts)
  // Logic: Completion Percentage based on total tasks
  let todoScore = 0;
  if (data.todos && data.todos.length > 0) {
    const total = data.todos.length;
    const completed = data.todos.filter(t => t.isDone).length;
    // Formula: (% Completed) * 20
    todoScore = (completed / total) * WEIGHTS.todo;
  }

  // Final Sum
  const totalScore = sleepScore + meditationScore + waterScore + stepsScore + todoScore;

  // Round off to nearest integer (e.g., 67.8 -> 68)
  return Math.round(totalScore);
};

// --- SAVE DATA TO SUPABASE ---
export const updateDailyLog = async (type: string, value: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const today = new Date().toISOString().split('T')[0];

    // 1. Check karo ke aaj no data already che ke nai
    const { data: currentData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    // 2. Data Prepare Karo
    let updates: any = { 
      user_id: user.id, 
      date: today,
      updated_at: new Date() 
    };

    if (currentData) {
        updates = { ...currentData }; // Juna data ne base tarike use karo
    }

    // 3. Navi value update karo
    if (type === 'meditation') updates.meditation_time = value;
    if (type === 'water') updates.water_intake = value;
    if (type === 'step') updates.step_count = parseInt(value);
    if (type === 'sleep') updates.sleep_data = value;
    if (type === 'todo') updates.todo_list = value;

    // 4. Score farithi calculate karo
    const scoreData: DailyData = {
        meditation: updates.meditation_time,
        water: updates.water_intake,
        steps: updates.step_count ? updates.step_count.toString() : '0',
        sleep: updates.sleep_data,
        todos: updates.todo_list
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

// --- FETCH DATA (JYARE APP OPEN THAY) ---
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
      
    if (error && error.code !== 'PGRST116') { // PGRST116 no matlab 'No data found' - e error nathi
        console.log("Error fetching:", error);
    }
    return data;
}

// TrackerService.ts ની અંદર છેલ્લે આ કોડ ઉમેરો

// --- USER PROFILE PHOTO ---
export const getUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Google login માં ફોટો 'avatar_url' માં હોય છે
    if (user && user.user_metadata && user.user_metadata.avatar_url) {
        return user.user_metadata.avatar_url;
    }
    return null; // જો ફોટો ના હોય તો null
}