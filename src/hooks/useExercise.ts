import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export interface ExerciseEntry {
  id: string;
  user_id: string;
  date: string;
  type: string;
  name: string;
  duration_min: number;
  calories_burned: number;
  created_at: string;
}

// MET values for common exercises (Metabolic Equivalent of Task)
const MET_VALUES: Record<string, number> = {
  walking: 3.5,
  running: 9.8,
  jogging: 7.0,
  cycling: 7.5,
  swimming: 8.0,
  yoga: 3.0,
  weights: 6.0,
  hiit: 8.0,
  stretching: 2.5,
  dancing: 5.5,
  sports: 7.0,
  hiking: 6.0,
  rowing: 7.0,
  jumping_rope: 12.3,
  other: 5.0,
};

export const EXERCISE_TYPES = [
  { id: 'walking', label: 'Walking', icon: '🚶', met: 3.5 },
  { id: 'running', label: 'Running', icon: '🏃', met: 9.8 },
  { id: 'cycling', label: 'Cycling', icon: '🚴', met: 7.5 },
  { id: 'swimming', label: 'Swimming', icon: '🏊', met: 8.0 },
  { id: 'weights', label: 'Weights', icon: '🏋️', met: 6.0 },
  { id: 'yoga', label: 'Yoga', icon: '🧘', met: 3.0 },
  { id: 'hiit', label: 'HIIT', icon: '⚡', met: 8.0 },
  { id: 'sports', label: 'Sports', icon: '⚽', met: 7.0 },
  { id: 'dancing', label: 'Dancing', icon: '💃', met: 5.5 },
  { id: 'other', label: 'Other', icon: '🔥', met: 5.0 },
];

export function calculateCaloriesBurned(
  exerciseType: string,
  durationMin: number,
  weightKg: number
): number {
  const met = MET_VALUES[exerciseType] || 5.0;
  // Calories = MET × weight(kg) × duration(hours)
  return Math.round(met * weightKg * (durationMin / 60));
}

export function useExercise(userId: string | null) {
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('exercise_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Total calories burned today
  const today = new Date().toISOString().split('T')[0];
  const todayBurned = entries
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.calories_burned, 0);

  // Calories burned on a specific date
  const getBurnedForDate = (date: string) =>
    entries
      .filter((e) => e.date === date)
      .reduce((sum, e) => sum + e.calories_burned, 0);

  const addEntry = async (data: {
    type: string;
    name: string;
    duration_min: number;
    calories_burned: number;
  }) => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('exercise_entries').insert({
      user_id: userId,
      date: today,
      ...data,
    });
    if (!error) await loadEntries();
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('exercise_entries').delete().eq('id', id).eq('user_id', userId);
    await loadEntries();
  };

  return {
    entries,
    loading,
    todayBurned,
    getBurnedForDate,
    addEntry,
    deleteEntry,
  };
}
