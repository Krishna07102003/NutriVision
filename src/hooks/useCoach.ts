import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { UserProfile, MacroGoals, MacroTotals, NutritionEntry, ChatMessage } from '../types';
import { askGemini } from '../geminiClient';
import { checkLimit } from '../utils/rateLimit';

interface UseCoachReturn {
  aiCoach: string | null;
  loadingCoach: boolean;
  dietPlan: string | null;
  loadingDietPlan: boolean;
  chatHistory: ChatMessage[];
  chatLoading: boolean;
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  getAICoaching: () => Promise<void>;
  generateDietPlan: () => Promise<void>;
  sendChatMessage: () => Promise<void>;
  setDietPlan: (plan: string | null) => void;
  deleteDietPlan: () => Promise<void>;
}

export function useCoach(
  userId: string | null,
  userProfile: UserProfile | null,
  goals: MacroGoals,
  totals: MacroTotals,
  todayEntries: NutritionEntry[]
): UseCoachReturn {
  const [aiCoach, setAiCoach] = useState<string | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [dietPlan, setDietPlan] = useState<string | null>(null);
  const [loadingDietPlan, setLoadingDietPlan] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const loadChatHistory = async () => {
      const { data, error } = await supabase
        .from('chat_history')
        .select('role, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (!error && data) {
        setChatHistory(data.map((row) => ({ role: row.role, content: row.content })));
      }
    };

    const loadDietPlan = async () => {
      const { data } = await supabase
        .from('diet_plans')
        .select('plan_text')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.plan_text) {
        setDietPlan(data.plan_text);
      }
    };

    loadChatHistory();
    loadDietPlan();
  }, [userId]);

  const getAICoaching = async () => {
    if (!userProfile) return;
    const limit = checkLimit('AI_GENERATION');
    if (!limit.allowed) {
      setAiCoach(`AI is busy. Please wait ${limit.retryAfter} seconds before trying again.`);
      return;
    }
    setLoadingCoach(true);
    try {
      const mealsData = todayEntries.map((e) => `${e.name} (${e.serving})`).join(', ');
      const text = await askGemini(`As a nutrition coach for ${userProfile.name} (Goal: ${userProfile.goal}, Diet: ${userProfile.dietType}), analyze today's intake:\nMeals eaten: ${mealsData || 'No meals yet'}\nCurrent totals: ${Math.round(totals.calories)} cal, ${Math.round(totals.protein)}g protein, ${Math.round(totals.carbs)}g carbs, ${Math.round(totals.fat)}g fat\nDaily goals: ${goals.calories} cal, ${goals.protein}g protein, ${goals.carbs}g carbs, ${goals.fat}g fat\n\nProvide: 1) Brief analysis (2 sentences), 2) One actionable tip for next meal, 3) A motivational note. Under 100 words total.`);
      setAiCoach(text || '');
    } catch {
      setAiCoach('Unable to generate coaching right now.');
    } finally {
      setLoadingCoach(false);
    }
  };

  const generateDietPlan = async () => {
    if (!userProfile) return;
    const limit = checkLimit('AI_GENERATION');
    if (!limit.allowed) {
      setDietPlan(`AI is busy. Please wait ${limit.retryAfter} seconds before trying again.`);
      return;
    }
    setLoadingDietPlan(true);
    try {
      const plan = await askGemini(`Create a simple 7-day Indian meal plan for a ${userProfile.dietType} person. Goal: ${userProfile.goal}. Daily target: ${goals.calories} calories, ${goals.protein}g protein.\n\nIMPORTANT: Use ONLY Indian food items — dal, rice, roti, chapati, sabzi, curd, paneer, idli, dosa, poha, upma, paratha, rajma, chole, sambar, rasam, buttermilk, lassi, sprouts, chilla, sandwich, oats with Indian flavors, etc. No western food like pasta, sandwich, toast, cereal.\n\nFormat it like this simple menu style - NO headers, NO bullet points, NO bold text, NO client profile section. Just plain text:\n\nDay 1\nBreakfast: [Indian food item] - [calories] cal, [protein]g protein\nMid-Morning Snack: [Indian food item] - [calories] cal, [protein]g protein\nLunch: [Indian food item] - [calories] cal, [protein]g protein\nEvening Snack: [Indian food item] - [calories] cal, [protein]g protein\nDinner: [Indian food item] - [calories] cal, [protein]g protein\n\n(Repeat for 7 days total)\n\nKeep meals simple, practical, easy to cook at home. Use common Indian household ingredients. No markdown formatting.`);
      setDietPlan(plan || '');

      await supabase.from('diet_plans').upsert({
        user_id: userId,
        plan_text: plan,
        created_at: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDietPlan('Unable to generate diet plan: ' + msg);
    } finally {
      setLoadingDietPlan(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !userProfile) return;
    const limit = checkLimit('AI_GENERATION');
    if (!limit.allowed) {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: `AI is busy. Please wait ${limit.retryAfter} seconds.` }]);
      return;
    }
    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    try {
      const context = `User: ${userProfile.name}, Goal: ${userProfile.goal}, Diet: ${userProfile.dietType}. Today: ${Math.round(totals.calories)} cal, ${Math.round(totals.protein)}g protein, ${Math.round(totals.carbs)}g carbs, ${Math.round(totals.fat)}g fat of ${goals.calories} cal, ${goals.protein}g protein, ${goals.carbs}g carbs, ${goals.fat}g fat goals. Recent meals: ${todayEntries.slice(0, 3).map((e) => e.name).join(', ')}`;

      // Limit to last 20 messages to prevent token overflow
      const recentChat = chatHistory.slice(-20);
      const chatContext = recentChat.map((m) => `${m.role}: ${m.content}`).join('\n');

      const aiResponse = await askGemini(
        `${context}\n\nRecent conversation:\n${chatContext}\n\nUser question: ${userMsg}\n\nRespond as a friendly nutrition coach. Keep answers concise and actionable.`
      ) || 'Sorry, I could not process that.';
      setChatHistory((prev) => [...prev, { role: 'assistant', content: aiResponse }]);

      await supabase.from('chat_history').insert([
        { user_id: userId, role: 'user', content: userMsg, created_at: new Date().toISOString() },
        { user_id: userId, role: 'assistant', content: aiResponse, created_at: new Date().toISOString() },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const deleteDietPlan = async () => {
    if (!userId) return;
    await supabase.from('diet_plans').delete().eq('user_id', userId);
    setDietPlan(null);
  };

  return {
    aiCoach,
    loadingCoach,
    dietPlan,
    loadingDietPlan,
    chatHistory,
    chatLoading,
    chatMessage,
    setChatMessage,
    showChat,
    setShowChat,
    getAICoaching,
    generateDietPlan,
    sendChatMessage,
    setDietPlan,
    deleteDietPlan,
  };
}
