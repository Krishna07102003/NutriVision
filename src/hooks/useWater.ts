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
    // Get ALL rows for today (there may be duplicates from old broken upsert)
    const { data, error } = await supabase
      .from('water_intake')
      .select('id, litres')
      .eq('user_id', userId)
      .eq('date', todayStr())
      .order('id', { ascending: false });

    if (error && import.meta.env.DEV) console.error('Water load error:', error);

    if (data && data.length > 0) {
      // Keep only the latest row, delete duplicates
      const latest = data[0];
      setLitres(latest.litres ?? 0);

      // Clean up duplicate rows (keep latest, delete rest)
      if (data.length > 1) {
        const idsToDelete = data.slice(1).map((r: { id: number }) => r.id);
        await supabase.from('water_intake').delete().in('id', idsToDelete);
      }
    } else {
      setLitres(0);
    }
    setLoading(false);
  };

  const addWater = useCallback(async (amount: number) => {
    const newLitres = Math.max(0, Math.min(GOAL_L, litres + amount));
    setLitres(newLitres);

    // Get all rows for today
    const { data: existing } = await supabase
      .from('water_intake')
      .select('id')
      .eq('user_id', userId)
      .eq('date', todayStr())
      .order('id', { ascending: false });

    if (existing && existing.length > 0) {
      // Update the latest row
      await supabase
        .from('water_intake')
        .update({ litres: newLitres, updated_at: new Date().toISOString() })
        .eq('id', existing[0].id);

      // Delete any duplicates
      if (existing.length > 1) {
        const idsToDelete = existing.slice(1).map((r: { id: number }) => r.id);
        await supabase.from('water_intake').delete().in('id', idsToDelete);
      }
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
        .order('id', { ascending: false })
        .limit(1)
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
