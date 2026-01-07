// lib/PortfolioService.ts
import { supabase } from './supabase';

export interface PortfolioItem {
  id: string;
  link: string;
  title: string;
  image_url?: string;
}

// 1. પોર્ટફોલિયો લિસ્ટ મેળવો (Get)
export const getUserPortfolios = async (): Promise<PortfolioItem[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_portfolios')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching portfolios:', error);
    return [];
  }
  return data || [];
};

// 2. નવો પોર્ટફોલિયો સેવ કરો (Add)
export const saveUserPortfolio = async (link: string, title: string, image_url: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  // અહિયાં તમે ભવિષ્યમાં Link પરથી Image/Title જાતે લાવી શકો છો
  // અત્યારે આપણે Default Title અને Image રાખીએ છીએ.
  const { data, error } = await supabase
    .from('user_portfolios')
    .insert([
      { 
        user_id: user.id, 
        link: link, 
        title: title,
        image_url: image_url // Default image or logic to fetch
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 3. પોર્ટફોલિયો ડિલીટ કરો (Delete)
export const deleteUserPortfolio = async (id: string) => {
  const { error } = await supabase
    .from('user_portfolios')
    .delete()
    .eq('id', id);

  if (error) throw error;
};