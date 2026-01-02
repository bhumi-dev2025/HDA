// lib/SkillService.ts
import { supabase } from './supabase';

// 1. ડેટા લાવવા માટે (Fetch)
export const getUserSkills = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // આપણે અહિયાં 'skill_name' કોલમમાં ID સ્ટોર કરીશું
    const { data, error } = await supabase
      .from('user_skills')
      .select('skill_name') 
      .eq('user_id', user.id);

    if (error) throw error;
    
    // ડેટાબેઝમાંથી ફક્ત IDs નું લિસ્ટ રિટર્ન કરો (['1', '2', ...])
    return data.map(item => item.skill_name);
  } catch (error) {
    console.log('Error fetching skills:', error);
    return [];
  }
};

// 2. ડેટા સેવ કરવા માટે (Sync: Delete Old + Insert New)
export const saveUserSkills = async (skillIds: string[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // A. પહેલા જુના બધા સ્કિલ્સ ડિલીટ કરો (Clean up)
    await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', user.id);

    // B. જો કોઈ સ્કિલ સિલેક્ટ કરી હોય, તો નવી ઇન્સેર્ટ કરો
    if (skillIds.length > 0) {
      const updates = skillIds.map(id => ({
        user_id: user.id,
        skill_name: id // આપણે ID સેવ કરીએ છીએ જેથી Icon મેપ કરી શકાય
      }));

      const { error } = await supabase
        .from('user_skills')
        .insert(updates);
        
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.log('Error saving skills:', error);
    return { success: false };
  }
};