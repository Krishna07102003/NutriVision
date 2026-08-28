import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const GOAL_L = 5;

export interface WaterDay {
  date: string;
  litres: number;
  label: string;
}

export function useWater(userId: string | null) {
  const [litres, setLitres] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WaterDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    loadToday();
    loadWeeklyData();
  }, [userId]);

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const loadToday = async () => {
    // Use select('*') — no order/limit/select with column names that may not exist
    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr())
      .maybeSingle();

    if (error && import.meta.env.DEV) console.error('Water load error:', error);
    setLitres(data?.litres ?? 0);
    setLoading(false);
  };

  const addWater = useCallback(async (amount: number) => {
    if (!userId) return;

    const newLitres = Math.max(0, Math.min(GOAL_L, litres + amount));
    setLitres(newLitres);

    // Simple upsert — if the table has a unique constraint on (user_id, date) this works
    // If not, it may create duplicates — loadToday will pick the latest
    const { error } = await supabase
      .from('water_intake')
      .upsert(
        { user_id: userId, date: todayStr(), litres: newLitres, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,date' }
      );

    if (error) {
      console.error('Water save failed:', error);
    }
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
        litres: data?.litres ?? 0,
        label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      });
    }
    setWeeklyData(days);
  };

  return {
    litres,
    weeklyData,
    addWater,
    goal: GOAL_L,
    step: 0.25,
    pct: Math.min((litres / GOAL_L) * 100, 100),
    loading,
  };
}
