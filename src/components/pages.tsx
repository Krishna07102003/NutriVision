import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Pencil, Camera, Image, Search, ScanBarcode } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNutrition } from '../hooks/useNutrition';
import { useCoach } from '../hooks/useCoach';
import { useWeight } from '../hooks/useWeight';
import { useFavorites } from '../hooks/useFavorites';
import { useRecipes } from '../hooks/useRecipes';
import { useExercise } from '../hooks/useExercise';
import { useLanguage } from '../i18n/LanguageContext';
import type { FoodItem } from '../data/foodDatabase';

import ErrorBanner from '../components/ErrorBanner';
import MacroDonut from '../components/MacroDonut';
import MealSection from '../components/MealSection';
import DailyInsight from '../components/DailyInsight';
import RecentMeals from '../components/RecentMeals';
import DateNavigator from '../components/DateNavigator';
import WaterTracker from '../components/WaterTracker';
import WeightLog from '../components/WeightLog';
import ExerciseLog from '../components/ExerciseLog';
import StepCounter from '../components/StepCounter';
import QuickAdd from '../components/QuickAdd';
import ManualEntry from '../components/ManualEntry';
import FoodSearch from '../components/FoodSearch';
import BarcodeScanner from '../components/BarcodeScanner';
import { SkeletonDashboard } from '../components/Skeleton';
import StreakBadge from '../components/StreakBadge';
import DietPlan from '../components/DietPlan';

interface DashboardProps {
  auth: ReturnType<typeof useAuth>;
  nutrition: ReturnType<typeof useNutrition>;
  coach: ReturnType<typeof useCoach>;
  weight: ReturnType<typeof useWeight>;
  favorites: ReturnType<typeof useFavorites>;
  recipes: ReturnType<typeof useRecipes>;
  exercise: ReturnType<typeof useExercise>;
  water: { litres: number; goal: number; step: number; addWater: (n: number) => void; pct: number; loading: boolean };
}

const MEAL_SECTIONS = [
  { type: 'breakfast', title: 'Breakfast', emoji: '☕' },
  { type: 'lunch', title: 'Lunch', emoji: '🍛' },
  { type: 'dinner', title: 'Dinner', emoji: '🍲' },
  { type: 'snack_am', title: 'Snacks', emoji: '🍪', alsoMatches: ['snack_pm'] },
];

export function Dashboard({ auth, nutrition, coach, weight, favorites, recipes, exercise, water }: DashboardProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualMealType, setManualMealType] = useState('breakfast');
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [quickMenuStep, setQuickMenuStep] = useState<'type' | 'action'>('type');
  const [quickMenuMealType, setQuickMenuMealType] = useState('breakfast');
  const [showBarcode, setShowBarcode] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const QUICK_MEAL_TYPES = [
    { value: 'breakfast', label: 'Breakfast', emoji: '☕' },
    { value: 'lunch', label: 'Lunch', emoji: '🍛' },
    { value: 'dinner', label: 'Dinner', emoji: '🍲' },
    { value: 'snack_am', label: 'Snacks', emoji: '🍪' },
  ];

  const handleQuickAdd = async (food: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string; mealType?: string }) => {
    // If no mealType provided, default to breakfast (Recent Meals now provides it)
    const mealType = food.mealType || 'breakfast';
    await nutrition.addManualEntry({ ...food, mealType });
    favorites.addRecent({ ...food, mealType });
  };

  const handleManualEntry = async (data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string; mealType: string }) => {
    await nutrition.addManualEntry({ ...data, mealType: data.mealType || 'breakfast' });
    favorites.addRecent(data);
  };

  const handleToggleFavorite = async (food: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string }) => {
    if (favorites.isFavorite(food.name)) {
      const fav = favorites.favorites.find((f) => f.name === food.name);
      if (fav) await favorites.removeFavorite(fav.id);
    } else {
      await favorites.addFavorite(food);
    }
  };

  if (nutrition.loadingEntries) {
    return <SkeletonDashboard />;
  }

  return (
    <div>
      <ErrorBanner message={nutrition.errorMsg} onDismiss={() => nutrition.setErrorMsg(null)} />
      {nutrition.photoCount > 90 && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          {nutrition.photoCount > 100
            ? `You have ${nutrition.photoCount} meal photos. Old photos (90+ days) will be auto-cleaned to save space.`
            : `You have ${nutrition.photoCount} meal photos. Storage will auto-clean photos older than 90 days.`
          }
        </div>
      )}

      <div className="flex items-center justify-between">
        <DateNavigator
          selectedDate={nutrition.selectedDate}
          onChange={nutrition.setSelectedDate}
          isToday={nutrition.isToday}
        />
        <StreakBadge entries={nutrition.entries} />
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12 mb-8 py-6 sm:py-8 px-4 card">
        <MacroDonut label={t('calories')} current={Math.round(nutrition.selectedTotals.calories)} goal={auth.goals.calories} unit=" kcal" ringVar="--ring-calories" />
        <MacroDonut label={t('protein')} current={Math.round(nutrition.selectedTotals.protein)} goal={auth.goals.protein} unit="g" ringVar="--ring-protein" />
        <MacroDonut label={t('carbs')} current={Math.round(nutrition.selectedTotals.carbs)} goal={auth.goals.carbs} unit="g" ringVar="--ring-carbs" />
        <MacroDonut label={t('fat')} current={Math.round(nutrition.selectedTotals.fat)} goal={auth.goals.fat} unit="g" ringVar="--ring-fat" />
      </div>

      {nutrition.isToday && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <WaterTracker litres={water.litres} goal={water.goal} step={water.step} onAdd={water.addWater} pct={water.pct} />
            <WeightLog entries={weight.entries} latest={weight.latest} onAdd={weight.addWeight} onDelete={weight.deleteWeight} />
          </div>
          <div className="mb-8">
            <ExerciseLog
              entries={exercise.entries}
              todayBurned={exercise.todayBurned}
              userWeight={parseFloat(auth.userProfile?.weight || '70')}
              onAdd={exercise.addEntry}
              onDelete={exercise.deleteEntry}
            />
          </div>
          <div className="mb-8">
            <StepCounter
              userWeight={parseFloat(auth.userProfile?.weight || '70')}
            />
          </div>
          <div className="mb-8">
            <QuickAdd
              recent={favorites.recent}
              favorites={favorites.favorites}
              onAdd={handleQuickAdd}
              onToggleFavorite={handleToggleFavorite}
              onRemoveFavorite={favorites.removeFavorite}
              isFavorite={favorites.isFavorite}
            />
          </div>
        </>
      )}

      {/* Meal Sections */}
      <div className="space-y-3 mb-8">
        {MEAL_SECTIONS.map((section) => (
          <MealSection
            key={section.type}
            title={section.title}
            emoji={section.emoji}
            mealType={section.type}
            entries={nutrition.selectedEntries.filter((e) => e.mealType === section.type || (section.alsoMatches && e.mealType != null && section.alsoMatches.includes(e.mealType)))}
            onDelete={nutrition.deleteEntry}
            onEdit={nutrition.editEntry}
            onAddManual={(mt) => { setManualMealType(mt); setShowManualEntry(true); }}
            onAddCamera={(mt) => { setManualMealType(mt); photoInputRef.current?.click(); }}
            onAddGallery={(mt) => { setManualMealType(mt); galleryInputRef.current?.click(); }}
            onAddSearch={(mt) => { setManualMealType(mt); setShowFoodSearch(true); }}
          />
        ))}
      </div>

      <RecentMeals recent={favorites.recent} onAdd={handleQuickAdd} />

      <div className="grid md:grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-3 card glow-hover rounded-card px-5 py-4 text-left btn-press"
        >
          <MessageSquare className="w-4 h-4 text-accent" />
          <span className="text-sm text-[var(--text-primary)]">{t('askCoach')}</span>
        </button>
        <button
          onClick={coach.generateDietPlan}
          disabled={coach.loadingDietPlan}
          className="flex items-center gap-3 card glow-hover rounded-card px-5 py-4 text-left btn-press"
        >
          <span className="text-accent text-sm">*</span>
          <span className="text-sm text-[var(--text-primary)]">
            {coach.loadingDietPlan ? t('buildingPlan') : coach.dietPlan ? t('regeneratePlan') : t('mealPlan')}
          </span>
          {coach.loadingDietPlan && (
            <div className="ml-auto w-3.5 h-3.5 border-2 border-[var(--border-color)] border-t-[var(--accent)] rounded-full animate-spin" />
          )}
        </button>
      </div>

      {coach.dietPlan && <DietPlan plan={coach.dietPlan} onDelete={coach.deleteDietPlan} />}

      {nutrition.selectedEntries.length > 0 && nutrition.isToday && (
        <DailyInsight aiCoach={coach.aiCoach} loadingCoach={coach.loadingCoach} onGenerate={coach.getAICoaching} />
      )}

      {/* Floating Quick Add Button + Popup Menu */}
      {showQuickMenu && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowQuickMenu(false); setQuickMenuStep('type'); }}>
          <div className="fixed left-1/2 -translate-x-1/2 bottom-28 w-[calc(100%-3rem)] max-w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {quickMenuStep === 'type' ? (
              <>
                <div className="px-4 pt-3 pb-2 border-b border-[var(--border-color)]">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold">Choose meal</p>
                </div>
                {QUICK_MEAL_TYPES.map((mt) => (
                  <button
                    key={mt.value}
                    onClick={() => { setQuickMenuMealType(mt.value); setQuickMenuStep('action'); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                  >
                    <span className="text-lg">{mt.emoji}</span>
                    <span className="text-sm text-[var(--text-primary)] font-semibold">{mt.label}</span>
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[var(--border-color)]">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold">
                    {QUICK_MEAL_TYPES.find(m => m.value === quickMenuMealType)?.emoji} {QUICK_MEAL_TYPES.find(m => m.value === quickMenuMealType)?.label}
                  </p>
                  <button onClick={() => setQuickMenuStep('type')} className="text-[10px] text-accent font-semibold">Back</button>
                </div>
                <button
                  onClick={() => { setShowQuickMenu(false); setQuickMenuStep('type'); setManualMealType(quickMenuMealType); setShowManualEntry(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                >
                  <Pencil className="w-4 h-4 text-accent" />
                  <span className="text-sm text-[var(--text-primary)] font-semibold">Add Manually</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); setQuickMenuStep('type'); setManualMealType(quickMenuMealType); photoInputRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                >
                  <Camera className="w-4 h-4 text-accent" />
                  <span className="text-sm text-[var(--text-primary)] font-semibold">Take Photo</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); setQuickMenuStep('type'); setManualMealType(quickMenuMealType); galleryInputRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                >
                  <Image className="w-4 h-4 text-accent" />
                  <span className="text-sm text-[var(--text-primary)] font-semibold">Upload from Gallery</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); setQuickMenuStep('type'); setShowFoodSearch(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                >
                  <Search className="w-4 h-4 text-accent" />
                  <span className="text-sm text-[var(--text-primary)] font-semibold">Search Food</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); setQuickMenuStep('type'); setShowBarcode(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                >
                  <ScanBarcode className="w-4 h-4 text-accent" />
                  <span className="text-sm text-[var(--text-primary)] font-semibold">Scan Barcode</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => { setShowQuickMenu(!showQuickMenu); setQuickMenuStep('type'); }}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-accent hover:bg-accent-dim text-[var(--text-primary)] rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-all btn-press hover:scale-110 haptic"
        title="Quick Add Meal"
      >
        <Plus className={`w-6 h-6 transition-transform ${showQuickMenu ? 'rotate-45' : ''}`} />
      </button>

      {/* Hidden photo inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => nutrition.handleImageUpload(e, manualMealType)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => nutrition.handleImageUpload(e, manualMealType)}
      />

      {/* Barcode Scanner */}
      {showBarcode && (
        <BarcodeScanner
          onResult={(food) => {
            const mt = quickMenuMealType || 'breakfast';
            nutrition.addManualEntry({ ...food, mealType: mt });
            favorites.addRecent({ ...food, mealType: mt });
            setShowBarcode(false);
          }}
          onClose={() => setShowBarcode(false)}
        />
      )}

      {/* Food Search modal */}
      {showFoodSearch && (
        <FoodSearch
          onSelect={(food) => {
            const mt = quickMenuMealType || 'breakfast';
            nutrition.addManualEntry({
              name: food.name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              serving: food.serving,
              mealType: mt,
            });
            favorites.addRecent({ ...food, mealType: mt });
            setShowFoodSearch(false);
          }}
          onManualEntry={() => {
            setShowFoodSearch(false);
            setManualMealType('breakfast');
            setShowManualEntry(true);
          }}
          onClose={() => setShowFoodSearch(false)}
        />
      )}

      {showManualEntry && (
        <ManualEntry
          initialMealType={manualMealType}
          onSubmit={handleManualEntry}
          onClose={() => setShowManualEntry(false)}
        />
      )}
    </div>
  );
}
