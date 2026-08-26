import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import type { NutritionEntry, NutritionData, MacroTotals, MacroGoals } from '../types';
import { askGeminiVision } from '../geminiClient';
import { validateFileUpload, sanitizeStoragePath } from '../utils/validation';
import { compressImage } from '../utils/imageCompression';
import { addToQueue, isOnline, getQueue, removeFromQueue } from '../utils/offlineQueue';

// Input validation
import { sanitizeText, isValidFoodName, isValidCalories, isValidMacro, clampNumber, localISO, todayLocal } from '../utils/validation';
import { checkLimit } from '../utils/rateLimit';

function validateEntry(data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string }): boolean {
  return isValidFoodName(data.name) && isValidCalories(data.calories);
}

interface UseNutritionReturn {
  entries: NutritionEntry[];
  todayEntries: NutritionEntry[];
  selectedEntries: NutritionEntry[];
  selectedTotals: MacroTotals;
  totals: MacroTotals;
  analyzing: boolean;
  activeMealType: string;
  setActiveMealType: (type: string) => void;
  loadingEntries: boolean;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
  showSuccess: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, mealType?: string) => Promise<void>;
  addManualEntry: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string; mealType?: string }) => Promise<void>;
  addFoodFromDatabase: (food: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string; mealType?: string }) => Promise<void>;
  editEntry: (id: string, data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string }) => Promise<void>;
  deleteEntry: (id: string) => void;
  undoDelete: () => void;
  resetDay: () => void;
  undoReset: () => void;
  pendingUndo: 'delete' | 'reset' | null;
  clearUndo: () => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  isToday: boolean;
  photoCount: number;
}


export function useNutrition(userId: string | null, goals: MacroGoals): UseNutritionReturn {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [activeMealType, setActiveMealType] = useState<string>('other');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pendingUndo, setPendingUndo] = useState<'delete' | 'reset' | null>(null);
  const [deletedEntry, setDeletedEntry] = useState<NutritionEntry | null>(null);
  const [deletedEntries, setDeletedEntries] = useState<NutritionEntry[]>([]);
  const undoTimerRef = useState<ReturnType<typeof setTimeout> | null>(null);
  const isUploadingRef = useState(false);

  useEffect(() => {
    if (userId) {
      loadEntries(true);
      cleanupOldPhotos();
      syncOfflineQueue();
    }
  }, [userId]);

  // Real-time sync: listen for changes to nutrition_entries
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('nutrition-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nutrition_entries',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Clean up photos older than 90 days (runs once on app load)
  const cleanupOldPhotos = async () => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const cutoffStr = cutoff.toISOString();

      // Get old entries with images
      const { data: oldEntries } = await supabase
        .from('nutrition_entries')
        .select('id, image_url')
        .eq('user_id', userId)
        .lt('timestamp', cutoffStr)
        .not('image_url', 'eq', '');

      if (!oldEntries || oldEntries.length === 0) return;

      for (const entry of oldEntries) {
        if (!entry.image_url) continue;

        // Check if any newer entry uses the same image
        const { data: newerRefs } = await supabase
          .from('nutrition_entries')
          .select('id')
          .eq('user_id', userId)
          .eq('image_url', entry.image_url)
          .gte('timestamp', cutoffStr)
          .limit(1);

        // Only delete if no newer entry references this image
        if (!newerRefs || newerRefs.length === 0) {
          const urlParts = entry.image_url.split('/meal-images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            // Safety: only delete files in this user's folder
            if (filePath.startsWith(userId + '/')) {
              await supabase.storage.from('meal-images').remove([filePath]);
            }
          }
        }
      }
    } catch {}
  };

  const loadEntries = async (isInitial = false) => {
    if (isInitial) setLoadingEntries(true);
    const { data, error } = await supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      setErrorMsg('Could not load meal entries. ' + error.message);
    } else {
      const freshEntries = (data || []).map((row) => ({
        id: row.id,
        timestamp: row.timestamp,
        image: row.image_url || '',
        name: row.name,
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fat: row.fat,
        serving: row.serving || '',
        healthInsight: row.health_insight || '',
        mealType: row.meal_type || 'other',
      }));

      if (isUploadingRef[0]) {
        // During upload: merge fresh entries with any pending optimistic entries
        setEntries((prev) => {
          const tempEntries = prev.filter((e) => e.id.startsWith('temp_'));
          const freshIds = new Set(freshEntries.map((e) => e.id));
          // Keep temp entries whose IDs are not yet in the database
          const pendingTemps = tempEntries.filter((e) => !freshIds.has(e.id));
          return [...pendingTemps, ...freshEntries];
        });
      } else {
        setEntries(freshEntries);
      }
    }
    if (isInitial) setLoadingEntries(false);
  };

  const showSuccessMsg = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const insertLocal = (entry: NutritionEntry) => {
    setEntries((prev) => [entry, ...prev]);
    showSuccessMsg();
  };

  // Sync queued offline actions when back online
  const syncOfflineQueue = async () => {
    if (!isOnline() || !userId) return;
    const queue = getQueue();
    for (const action of queue) {
      try {
        if (action.type === 'add_entry') {
          await supabase.from('nutrition_entries').insert({
            user_id: userId,
            ...action.data,
          });
        }
        removeFromQueue(action.id);
      } catch {}
    }
  };

  // Listen for online event to sync
  useEffect(() => {
    const handleOnline = () => syncOfflineQueue();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId]);

  const addManualEntry = async (data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string; mealType?: string }) => {
    const limit = checkLimit('MEAL_LOG');
    if (!limit.allowed) {
      setErrorMsg(`Too many meals logged. Please wait ${limit.retryAfter} seconds.`);
      return;
    }
    if (!validateEntry(data)) {
      setErrorMsg('Please enter a valid food name and calories.');
      return;
    }

    const safeData = {
      name: sanitizeText(data.name),
      calories: clampNumber(String(data.calories), 1, 4999),
      protein: clampNumber(String(data.protein), 0, 500),
      carbs: clampNumber(String(data.carbs), 0, 1000),
      fat: clampNumber(String(data.fat), 0, 500),
      serving: sanitizeText(data.serving) || 'serving',
    };

    // Optimistic UI: add immediately
    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    const timestamp = localISO();
    insertLocal({
      id: tempId,
      timestamp,
      image: '',
      ...safeData,
      mealType: data.mealType || 'other',
      healthInsight: '',
    });

    // If offline, queue for later sync
    if (!isOnline()) {
      addToQueue({
        type: 'add_entry',
        data: {
          user_id: userId,
          timestamp,
          image_url: '',
          name: safeData.name,
          calories: safeData.calories,
          protein: safeData.protein,
          carbs: safeData.carbs,
          fat: safeData.fat,
          serving: safeData.serving,
          health_insight: '',
          meal_type: data.mealType || 'other',
        },
      });
      return;
    }

    const { data: inserted, error } = await supabase
      .from('nutrition_entries')
      .insert({
        user_id: userId,
        timestamp,
        image_url: '',
        name: safeData.name,
        calories: safeData.calories,
        protein: safeData.protein,
        carbs: safeData.carbs,
        fat: safeData.fat,
        serving: safeData.serving,
        health_insight: '',
        meal_type: data.mealType || 'other',
      })
      .select()
      .single();

    if (error) {
      // Revert optimistic add
      setEntries((prev) => prev.filter((e) => e.id !== tempId));
      setErrorMsg('Could not save entry. ' + error.message);
    } else {
      // Replace temp with real ID
      setEntries((prev) =>
        prev.map((e) => (e.id === tempId ? { ...e, id: inserted.id } : e))
      );
    }
  };

  const addFoodFromDatabase = async (food: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string; mealType?: string }) => {
    await addManualEntry(food);
  };

  const editEntry = async (id: string, data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string }) => {
    const safeData = {
      name: sanitizeText(data.name) || data.name,
      calories: clampNumber(String(data.calories), 1, 4999),
      protein: clampNumber(String(data.protein), 0, 500),
      carbs: clampNumber(String(data.carbs), 0, 1000),
      fat: clampNumber(String(data.fat), 0, 500),
      serving: data.serving,
    };

    // Optimistic update
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...safeData } : e)));

    const { error } = await supabase
      .from('nutrition_entries')
      .update(safeData)
      .eq('id', id);

    if (error) {
      // Revert on error
      loadEntries();
      setErrorMsg('Could not update entry. ' + error.message);
    } else {
      showSuccessMsg();
    }
  };

  const MAX_PHOTO_UPLOADS_PER_DAY = 4;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, mealType?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Capture upload time BEFORE any processing (compression, AI, storage upload takes seconds)
    const uploadTimestamp = localISO();
    isUploadingRef[0] = true;
    setAnalyzing(true);
    setErrorMsg(null);

    try {
      // Check daily photo upload limit
      const today = new Date();
      const startOfDay = todayLocal() + 'T00:00:00';
      const { count } = await supabase
        .from('nutrition_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('image_url', 'is', null)
        .gte('timestamp', startOfDay);

      if ((count ?? 0) >= MAX_PHOTO_UPLOADS_PER_DAY) {
        setErrorMsg(`You've reached the daily limit of ${MAX_PHOTO_UPLOADS_PER_DAY} photo uploads. Try logging meals manually instead.`);
        setAnalyzing(false);
        return;
      }

      // Validate file before processing
      const fileCheck = validateFileUpload(file);
      if (!fileCheck.valid) {
        setErrorMsg(fileCheck.error || 'Invalid file.');
        setAnalyzing(false);
        return;
      }
      // Compress image before upload (saves ~70% storage)
      const compressedBlob = await compressImage(file, 800, 0.7);
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const resultStr = reader.result as string;
          resolve(resultStr.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });

      const safeFileName = sanitizeStoragePath(`${Date.now()}-${file.name}`);
      const filePath = `${userId}/${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(filePath, compressedFile, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(filePath);
      const imageUrl = publicUrlData.publicUrl;

      const text = await askGeminiVision(
        file.type,
        base64,
        'Analyze this food image and provide nutritional estimates. Also give a brief health insight (1 sentence). Respond ONLY with valid JSON (no markdown) in this format: {"name": "food name", "calories": number, "protein": number, "carbs": number, "fat": number, "serving": "serving size description", "healthInsight": "brief insight"}'
      );

      let nutrition: NutritionData;
      try {
        nutrition = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        throw new Error('Could not parse nutrition data from the AI response.');
      }

      const { data: inserted, error: insertError } = await supabase
        .from('nutrition_entries')
        .insert({
          user_id: userId,
          timestamp: uploadTimestamp,
          image_url: imageUrl,
          name: nutrition.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          serving: nutrition.serving,
          health_insight: nutrition.healthInsight,
          meal_type: mealType || activeMealType || 'other',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      insertLocal({ id: inserted.id, timestamp: uploadTimestamp, image: imageUrl, ...nutrition });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      setErrorMsg('Failed to log this meal. ' + message);
    } finally {
      setAnalyzing(false);
      isUploadingRef[0] = false;
    }
  };

  const clearUndoTimer = () => {
    if (undoTimerRef[0]) clearTimeout(undoTimerRef[0]);
  };

  const startUndoTimer = () => {
    clearUndoTimer();
    undoTimerRef[0] = setTimeout(() => {
      setPendingUndo(null);
      setDeletedEntry(null);
      setDeletedEntries([]);
    }, 5000);
  };

  const deleteEntry = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    // Remove from UI immediately
    setEntries((prev) => prev.filter((e) => e.id !== id));

    // Delete from database
    const { error } = await supabase.from('nutrition_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) {
      setErrorMsg('Could not delete entry. ' + error.message);
      setEntries((prev) => [entry, ...prev]);
      return;
    }

    // Clean up photo from storage if no other entries reference it
    if (entry.image) {
      try {
        const { data: otherEntries } = await supabase
          .from('nutrition_entries')
          .select('id')
          .eq('image_url', entry.image)
          .neq('id', id)
          .limit(1);

        if (!otherEntries || otherEntries.length === 0) {
          const urlParts = entry.image.split('/meal-images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            if (filePath.startsWith(userId + '/')) {
              await supabase.storage.from('meal-images').remove([filePath]);
            }
          }
        }
      } catch {}
    }
  };

  const undoDelete = () => {
    setPendingUndo(null);
    setDeletedEntry(null);
  };

  const resetDay = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayEntries = entries.filter((e) => new Date(e.timestamp) >= startOfDay);
    if (todayEntries.length === 0) return;

    // Optimistic reset
    setDeletedEntries(todayEntries);
    setEntries((prev) => prev.filter((e) => new Date(e.timestamp) < startOfDay));
    setPendingUndo('reset');
    startUndoTimer();

    // Delete from database IMMEDIATELY
    const { error } = await supabase
      .from('nutrition_entries')
      .delete()
      .eq('user_id', userId)
      .gte('timestamp', startOfDay.toISOString());
    if (error) {
      setErrorMsg('Could not reset today. ' + error.message);
      setEntries((prev) => [...todayEntries, ...prev]);
      setPendingUndo(null);
      setDeletedEntries([]);
    }
  };

  const undoReset = async () => {
    clearUndoTimer();
    if (deletedEntries.length > 0) {
      // Re-insert all deleted entries back into database
      const entriesToRestore = deletedEntries.map((e) => ({
        user_id: userId,
        timestamp: e.timestamp,
        image_url: e.image || '',
        name: e.name,
        calories: e.calories,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
        serving: e.serving,
        health_insight: e.healthInsight,
        meal_type: e.mealType || 'other',
      }));
      const { data: restored, error } = await supabase
        .from('nutrition_entries')
        .insert(entriesToRestore)
        .select();

      if (error) {
        setErrorMsg('Could not restore entries. ' + error.message);
      } else {
        setEntries((prev) => [...restored.map((r, i) => ({ ...deletedEntries[i], id: r.id })), ...prev]);
      }
    }
    setPendingUndo(null);
    setDeletedEntries([]);
  };

  const clearUndo = () => {
    clearUndoTimer();
    setPendingUndo(null);
    setDeletedEntry(null);
    setDeletedEntries([]);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const selectedEntries = useMemo(() => {
    const dateStr = selectedDate.toDateString();
    return entries.filter((e) => new Date(e.timestamp).toDateString() === dateStr);
  }, [entries, selectedDate]);

  const todayEntries = useMemo(
    () => entries.filter((e) => new Date(e.timestamp).toDateString() === new Date().toDateString()),
    [entries]
  );

  const totals = useMemo(
    () =>
      todayEntries.reduce(
        (acc, entry) => ({
          calories: acc.calories + (entry.calories || 0),
          protein: acc.protein + (entry.protein || 0),
          carbs: acc.carbs + (entry.carbs || 0),
          fat: acc.fat + (entry.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [todayEntries]
  );

  const selectedTotals = useMemo(
    () =>
      selectedEntries.reduce(
        (acc, entry) => ({
          calories: acc.calories + (entry.calories || 0),
          protein: acc.protein + (entry.protein || 0),
          carbs: acc.carbs + (entry.carbs || 0),
          fat: acc.fat + (entry.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [selectedEntries]
  );

  return {
    entries,
    todayEntries,
    selectedEntries,
    selectedTotals,
    totals,
    analyzing,
    activeMealType,
    setActiveMealType,
    loadingEntries,
    errorMsg,
    setErrorMsg,
    showSuccess,
    handleImageUpload,
    addManualEntry,
    addFoodFromDatabase,
    editEntry,
    deleteEntry,
    undoDelete,
    resetDay,
    undoReset,
    pendingUndo,
    clearUndo,
    selectedDate,
    setSelectedDate,
    isToday,
    photoCount: entries.filter((e) => e.image).length,
  };
}
