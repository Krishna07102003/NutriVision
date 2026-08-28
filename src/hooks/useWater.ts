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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    loadToday();
    loadWeeklyData();
  }, [userId]);

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const loadToday = async () => {
    const { data, error: loadErr } = await supabase
      .from('water_intake')
      .select('id, litres')
      .eq('user_id', userId!)
      .eq('date', todayStr())
      .order('id', { ascending: false })
      .limit(1);

    if (loadErr) {
      console.error('Water load error:', loadErr);
      setError('Failed to load water data');
    }

    if (data && data.length > 0) {
      setLitres(data[0].litres ?? 0);
    } else {
      setLitres(0);
    }
    setLoading(false);
  };

  const addWater = useCallback(async (amount: number) => {
    if (!userId) {
      setError('Not logged in');
      return;
    }

    const newLitres = Math.max(0, Math.min(GOAL_L, litres + amount));
    setLitres(newLitres);
    setError(null);

    const date = todayStr();

    // Check if record exists
    const { data: existing, error: selErr } = await supabase
      .from('water_intake')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .limit(1)
      .maybeSingle();

    if (selErr) {
      console.error('Water select error:', selErr);
      setError('Failed to check existing water data');
      return;
    }

    if (existing?.id) {
      // UPDATE existing row
      const { error: updErr } = await supabase
        .from('water_intake')
        .update({ litres: newLitres, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (updErr) {
        console.error('Water update error:', updErr);
        setError('Failed to save water: ' + updErr.message);
      }
    } else {
      // INSERT new row
      const { error: insErr } = await supabase
        .from('water_intake')
        .insert({ user_id: userId, date, litres: newLitres });

      if (insErr) {
        console.error('Water insert error:', insErr);
        setError('Failed to save water: ' + insErr.message);
      }
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
    step: 0.25,
    pct: Math.min((litres / GOAL_L) * 100, 100),
    loading,
    error,
  };
}
