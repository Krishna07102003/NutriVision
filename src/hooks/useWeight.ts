import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import type { WeightEntry } from '../types';

interface UseWeightReturn {
  entries: WeightEntry[];
  latest: WeightEntry | null;
  addWeight: (kg: number) => Promise<void>;
  deleteWeight: (id: string) => Promise<void>;
  errorMsg: string | null;
  loading: boolean;
}

export function useWeight(userId: string | null): UseWeightReturn {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadEntries();
  }, [userId]);

  // Real-time sync
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('weight-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'weight_entries',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      setErrorMsg('Could not load weight data. ' + error.message);
    } else {
      setEntries(
        (data || []).map((row) => ({
          id: row.id,
          weight: row.weight,
          date: row.date,
          created_at: row.created_at,
        }))
      );
    }
    setLoading(false);
  };

  const addWeight = async (kg: number) => {
    const today = new Date().toISOString().split('T')[0];

    // Check if today already has an entry — update it instead
    const existing = entries.find((e) => e.date === today);
    if (existing) {
      const { error } = await supabase
        .from('weight_entries')
        .update({ weight: kg })
        .eq('id', existing.id);
      if (error) {
        setErrorMsg('Could not update weight. ' + error.message);
        return;
      }
      setEntries((prev) =>
        prev.map((e) => (e.id === existing.id ? { ...e, weight: kg } : e))
      );
    } else {
      const { data, error } = await supabase
        .from('weight_entries')
        .insert({ user_id: userId, weight: kg, date: today })
        .select()
        .single();
      if (error) {
        setErrorMsg('Could not log weight. ' + error.message);
        return;
      }
      setEntries((prev) => [
        { id: data.id, weight: kg, date: today, created_at: data.created_at },
        ...prev,
      ]);
    }
  };

  const deleteWeight = async (id: string) => {
    const { error } = await supabase.from('weight_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) {
      setErrorMsg('Could not delete weight entry. ' + error.message);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const latest = entries.length > 0 ? entries[0] : null;

  return { entries, latest, addWeight, deleteWeight, errorMsg, loading };
}
