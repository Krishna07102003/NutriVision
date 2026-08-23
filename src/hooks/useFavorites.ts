import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { FavoriteFood } from '../types';

const RECENT_KEY = 'nutrivision_recent_foods';
const MAX_RECENT = 10;

interface FoodToAdd {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  mealType?: string;
}

interface UseFavoritesReturn {
  recent: FoodToAdd[];
  favorites: FavoriteFood[];
  addRecent: (food: FoodToAdd) => void;
  addFavorite: (food: FoodToAdd) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (name: string) => boolean;
  loading: boolean;
}

export function useFavorites(userId: string | null): UseFavoritesReturn {
  const [recent, setRecent] = useState<FoodToAdd[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('favorite_foods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      setFavorites(
        (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          calories: row.calories,
          protein: row.protein,
          carbs: row.carbs,
          fat: row.fat,
          serving: row.serving,
          user_id: row.user_id,
          created_at: row.created_at,
        }))
      );
    }
    setLoading(false);
  };

  const addRecent = useCallback((food: FoodToAdd) => {
    setRecent((prev) => {
      const filtered = prev.filter((f) => f.name !== food.name);
      const updated = [food, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addFavorite = async (food: FoodToAdd) => {
    const { data, error } = await supabase
      .from('favorite_foods')
      .insert({
        user_id: userId,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        serving: food.serving,
      })
      .select()
      .single();

    if (!error && data) {
      setFavorites((prev) => [
        {
          id: data.id,
          name: data.name,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          serving: data.serving,
          user_id: data.user_id,
          created_at: data.created_at,
        },
        ...prev,
      ]);
    }
  };

  const removeFavorite = async (id: string) => {
    const { error } = await supabase.from('favorite_foods').delete().eq('id', id).eq('user_id', userId);
    if (!error) {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const isFavorite = (name: string) => favorites.some((f) => f.name === name);

  return { recent, favorites, addRecent, addFavorite, removeFavorite, isFavorite, loading };
}
