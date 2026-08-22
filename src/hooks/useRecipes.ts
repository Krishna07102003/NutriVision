import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Recipe, RecipeIngredient } from '../types';

interface UseRecipesReturn {
  recipes: Recipe[];
  createRecipe: (name: string, ingredients: RecipeIngredient[]) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  logRecipe: (recipe: Recipe) => Promise<void>;
  loading: boolean;
  errorMsg: string | null;
}

export function useRecipes(userId: string | null, onLog: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string }) => Promise<void>): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userId) loadRecipes();
  }, [userId]);

  const loadRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg('Could not load recipes. ' + error.message);
    } else {
      setRecipes(
        (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          ingredients: row.ingredients || [],
          totalCalories: row.total_calories,
          totalProtein: row.total_protein,
          totalCarbs: row.total_carbs,
          totalFat: row.total_fat,
          user_id: row.user_id,
          created_at: row.created_at,
        }))
      );
    }
    setLoading(false);
  };

  const createRecipe = async (name: string, ingredients: RecipeIngredient[]) => {
    const totals = ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + ing.calories * ing.quantity,
        protein: acc.protein + ing.protein * ing.quantity,
        carbs: acc.carbs + ing.carbs * ing.quantity,
        fat: acc.fat + ing.fat * ing.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        name,
        ingredients,
        total_calories: Math.round(totals.calories),
        total_protein: Math.round(totals.protein),
        total_carbs: Math.round(totals.carbs),
        total_fat: Math.round(totals.fat),
      })
      .select()
      .single();

    if (error) {
      setErrorMsg('Could not save recipe. ' + error.message);
      return;
    }
    setRecipes((prev) => [
      {
        id: data.id,
        name,
        ingredients,
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.protein),
        totalCarbs: Math.round(totals.carbs),
        totalFat: Math.round(totals.fat),
        user_id: data.user_id,
        created_at: data.created_at,
      },
      ...prev,
    ]);
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase.from('recipes').delete().eq('id', id).eq('user_id', userId);
    if (!error) setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const logRecipe = async (recipe: Recipe) => {
    await onLog({
      name: recipe.name,
      calories: recipe.totalCalories,
      protein: recipe.totalProtein,
      carbs: recipe.totalCarbs,
      fat: recipe.totalFat,
      serving: `${recipe.ingredients.length} ingredients`,
    });
  };

  return { recipes, createRecipe, deleteRecipe, logRecipe, loading, errorMsg };
}
