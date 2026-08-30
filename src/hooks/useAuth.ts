import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, capacitorStorage } from '../supabaseClient';
import type { UserProfile, MacroGoals } from '../types';
import { ACTIVITY_MULTIPLIERS } from '../types';

interface AuthState {
  userId: string | null;
  authLoading: boolean;
  userProfile: UserProfile | null;
  goals: MacroGoals;
  setGoals: React.Dispatch<React.SetStateAction<MacroGoals>>;
}

export function useAuth(): AuthState & {
  loadUserProfile: () => Promise<void>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
} {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<MacroGoals>({
    calories: 2000, protein: 150, carbs: 250, fat: 65, bmr: 0, tdee: 0,
  });
  const sessionRestored = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      // On native apps, wait for Capacitor Preferences to load session tokens
      // into the cache before trying to read the session
      if (capacitorStorage?.waitForLoad) {
        await capacitorStorage.waitForLoad();
      }

      if (cancelled) return;

      // Now read the session (tokens should be in cache from Capacitor Preferences)
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        if (session.user.is_anonymous || session.user.app_metadata?.provider === 'anonymous') {
          await supabase.auth.signOut();
          sessionRestored.current = true;
          setAuthLoading(false);
          return;
        }
        setUserId(session.user.id);
      }
      sessionRestored.current = true;
      setAuthLoading(false);
    }

    initAuth().catch(() => {
      if (!cancelled) {
        sessionRestored.current = true;
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip events until getSession() has resolved (prevents race condition)
      if (!sessionRestored.current) return;

      if (session?.user?.is_anonymous) {
        await supabase.auth.signOut();
        setUserId(null);
        return;
      }
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const calculateGoals = useCallback((profile: UserProfile) => {
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    const age = parseFloat(profile.age) || 30;

    let bmr: number;
    if (profile.gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }

    const tdee = bmr * (ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.2);

    let calorieGoal = tdee;
    let proteinPerKg = 1.6;

    if (profile.goal === 'weight-loss') { calorieGoal = tdee - 500; proteinPerKg = 2.0; }
    else if (profile.goal === 'weight-gain') { calorieGoal = tdee + 500; proteinPerKg = 1.8; }
    else if (profile.goal === 'muscle-gain') { calorieGoal = tdee + 300; proteinPerKg = 2.2; }
    else if (profile.goal === 'athletic-performance') { calorieGoal = tdee + 200; proteinPerKg = 1.8; }

    const protein = weight * proteinPerKg;
    const fat = (calorieGoal * 0.25) / 9;
    const carbs = (calorieGoal - protein * 4 - fat * 9) / 4;

    setGoals({
      calories: Math.round(calorieGoal),
      protein: Math.round(protein),
      carbs: Math.round(Math.max(carbs, 0)),
      fat: Math.round(fat),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    });
  }, []);

  const loadUserProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return;

    const profile: UserProfile = {
      name: data.name,
      weight: data.weight,
      height: data.height,
      age: data.age,
      gender: data.gender,
      goal: data.goal,
      dietType: data.diet_type,
      activityLevel: data.activity_level,
    };
    setUserProfile(profile);
    calculateGoals(profile);
  };

  const saveUserProfile = async (profile: UserProfile & { referralSource?: string; previousApps?: string; painPoints?: string[]; accomplishment?: string }) => {
    const { error } = await supabase.from('user_profiles').upsert({
      id: userId,
      name: profile.name,
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      goal: profile.goal,
      diet_type: profile.dietType,
      activity_level: profile.activityLevel,
      referral_source: profile.referralSource || '',
      previous_apps: profile.previousApps || '',
      pain_points: profile.painPoints || [],
      accomplishment: profile.accomplishment || '',
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    setUserProfile(profile);
    calculateGoals(profile);
  };

  return {
    userId,
    authLoading,
    userProfile,
    goals,
    setGoals,
    loadUserProfile,
    saveUserProfile,
  };
}
