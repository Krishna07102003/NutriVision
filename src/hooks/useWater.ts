import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// Goal: 5 litres = 5000 ml (stored as integer in DB)
const GOAL_ML = 5000;

export interface WaterDay {
  date: string;
  litres: number;
  label: string;
}

export function useWater(userId: string | null) {
  const [litres, setLitres] = useState(0); // always in litres for display
  const [weeklyData, setWeeklyData] = useState<WaterDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    loadToday();
    loadWeeklyData();
  }, [userId]);

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const loadToday = async () => {
    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr())
      .maybeSingle();

    if (error && import.meta.env.DEV) console.error('Water load error:', error);
    // DB stores ml as integer, convert to litres for display
    const ml = data?.litres ?? 0;
    setLitres(ml / 1000);
    setLoading(false);
  };

  const addWater = useCallback(async (amount: number) => {
    if (!userId) return;

    // amount is in litres (0.25, 0.5, 1.0)
    // Convert to ml for integer storage
    const newLitres = Math.max(0, Math.min(GOAL_ML / 1000, litres + amount));
    setLitres(newLitres);

    const ml = Math.round(newLitres * 1000); // store as integer millilitres

    const { error } = await supabase
      .from('water_intake')
      .upsert(
        { user_id: userId, date: todayStr(), litres: ml, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,date' }
      );

    if (error) console.error('Water save failed:', error);
  }, [userId, litres]);

  const loadWeeklyData = async () => {
    const days: WaterDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const { data } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .maybeSingle();
      days.push({
        date: dateStr,
        litres: (data?.litres ?? 0) / 1000,
        label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      });
    }
    setWeeklyData(days);
  };

  return {
    litres,
    weeklyData,
    addWater,
    goal: GOAL_ML / 1000, // 5 litres
    step: 0.25,
    pct: Math.min((litres / (GOAL_ML / 1000)) * 100, 100),
    loading,
  };
}
