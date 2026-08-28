import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const STEP_L = 1;
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
    const { data, error } = await supabase
      .from('water_intake')
      .select('id, litres')
      .eq('user_id', userId)
      .eq('date', todayStr())
      .maybeSingle();

    if (error && import.meta.env.DEV) console.error('Water load error:', error);
    setLitres(data?.litres ?? 0);
    setLoading(false);
  };

  const addWater = useCallback(async (amount: number) => {
    const newLitres = Math.max(0, Math.min(GOAL_L, litres + amount));
    setLitres(newLitres);

    // Check if record exists for today
    const { data: existing } = await supabase
      .from('water_intake')
      .select('id')
      .eq('user_id', userId)
      .eq('date', todayStr())
      .maybeSingle();

    if (existing?.id) {
      // Update existing
      await supabase
        .from('water_intake')
        .update({ litres: newLitres, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      // Insert new
      await supabase
        .from('water_intake')
        .insert({ user_id: userId, date: todayStr(), litres: newLitres });
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
        .select('litres')
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
    step: STEP_L,
    pct: Math.min((litres / GOAL_L) * 100, 100),
    loading,
  };
}
