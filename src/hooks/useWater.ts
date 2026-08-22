import { useState, useEffect, useCallback, useRef } from 'react';
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
  const savingRef = useRef(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    loadToday();
    loadWeeklyData();
  }, [userId]);

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const loadToday = async () => {
    if (savingRef.current) return; // skip reload while saving
    const { data } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr())
      .maybeSingle();

    // Support both 'glasses' and 'litres' column names
    setLitres(data?.glasses ?? data?.litres ?? 0);
    setLoading(false);
  };

  const addWater = useCallback(async (amount: number) => {
    setLitres((prev) => {
      const next = Math.max(0, Math.min(GOAL_L, prev + amount));

      // Save to DB without blocking UI
      savingRef.current = true;
      supabase
        .from('water_intake')
        .upsert(
          { user_id: userId, date: todayStr(), litres: next, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,date' }
        )
        .then(({ error }) => {
          savingRef.current = false;
          if (error) console.error('Water sync failed:', error);
        });

      return next;
    });
  }, [userId]);

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
        litres: data?.litres ?? data?.glasses ?? 0,
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
