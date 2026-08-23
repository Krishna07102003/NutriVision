export interface UserProfile {
  name: string;
  weight: string;
  height: string;
  age: string;
  gender: 'male' | 'female' | '';
  goal: string;
  dietType: string;
  activityLevel: string;
}

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionEntry {
  id: string;
  timestamp: string;
  image: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  healthInsight: string;
  mealType?: string;
}

export interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  healthInsight: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface OnboardingFormData {
  // Phase 1: Pre-survey (screens 0-4)
  referralSource: string;
  previousApps: string; // 'yes' | 'no'
  painPoints: string[]; // multi-select
  accomplishment: string;
  // Phase 2: Body data (screens 5-7)
  name: string;
  weight: string;
  height: string;
  age: string;
  gender: string;
  goal: string;
  dietType: string;
  activityLevel: string;
}

export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// === Phase 1: Pre-Survey Options ===

export const REFERRAL_OPTIONS = [
  { id: 'app-store', label: 'App Store', icon: '📱' },
  { id: 'play-store', label: 'Play Store', icon: '🎮' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'x', label: 'X', icon: '❌' },
  { id: 'friend-family', label: 'Friend or family', icon: '👥' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'google', label: 'Google', icon: '🔍' },
] as const;

export const PAIN_POINT_OPTIONS = [
  { id: 'consistency', label: 'Lack of consistency', icon: '📊' },
  { id: 'unhealthy-habits', label: 'Unhealthy eating habits', icon: '🍔' },
  { id: 'support', label: 'Lack of support', icon: '🤝' },
  { id: 'busy-schedule', label: 'Busy schedule', icon: '📅' },
  { id: 'meal-inspiration', label: 'Lack of meal inspiration', icon: '🍎' },
] as const;

export const ACCOMPLISHMENT_OPTIONS = [
  { id: 'healthier', label: 'Eat and live healthier', icon: '🍎' },
  { id: 'energy-mood', label: 'Boost my energy and mood', icon: '☀️' },
  { id: 'motivated', label: 'Stay motivated and consistent', icon: '💪' },
  { id: 'body-confident', label: 'Feel better about my body', icon: '🧘' },
] as const;

export const GOAL_OPTIONS = [
  { id: 'weight-loss', label: 'Weight Loss', desc: 'Reduce body fat with a calorie deficit' },
  { id: 'weight-gain', label: 'Weight Gain', desc: 'Build mass with a calorie surplus' },
  { id: 'muscle-gain', label: 'Muscle Gain', desc: 'High protein, structured surplus' },
  { id: 'maintenance', label: 'Maintenance', desc: 'Hold steady at current weight' },
  { id: 'healthy-eating', label: 'Healthy Eating', desc: 'Better quality, no strict targets' },
  { id: 'athletic-performance', label: 'Performance', desc: 'Fuel training and recovery' },
] as const;

export const ACTIVITY_OPTIONS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { id: 'light', label: 'Lightly active', desc: '1–3 sessions per week' },
  { id: 'moderate', label: 'Moderately active', desc: '3–5 sessions per week' },
  { id: 'very', label: 'Very active', desc: '6–7 sessions per week' },
  { id: 'extra', label: 'Extra active', desc: 'Physical job plus training' },
] as const;

export const DIET_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'non-vegetarian', label: 'Non-Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
] as const;

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

// === Weight Tracking ===
export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  created_at: string;
}

// === Favorites & Recent ===
export interface FavoriteFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  user_id: string;
  created_at: string;
}

// === Recipes ===
export interface RecipeIngredient {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  user_id: string;
  created_at: string;
}

// === Weekly Stats ===
export interface DailyStats {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
