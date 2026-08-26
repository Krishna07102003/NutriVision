import { useState, useCallback } from 'react';
import { Routes, Route, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, MessageSquare, Calendar, User, Trash2, Menu, X, MessageSquareWarning, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { useNutrition } from './hooks/useNutrition';
import { useCoach } from './hooks/useCoach';
import { useWeight } from './hooks/useWeight';
import { useExercise } from './hooks/useExercise';
import { useFavorites } from './hooks/useFavorites';
import { useRecipes } from './hooks/useRecipes';
import { useWater } from './hooks/useWater';
import { useLanguage } from './i18n/LanguageContext';
import type { OnboardingFormData, OnboardingStep, UserProfile } from './types';
import { calculateAllGoals } from './utils/calculateGoals';
import { sanitizeText, clampNumber, isValidWeight, isValidHeight, isValidAge } from './utils/validation';

import ErrorBoundary from './components/ErrorBoundary';
import Onboarding from './components/Onboarding';
import AuthScreen from './components/AuthScreen';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import ExportButton from './components/ExportButton';
import Disclaimer from './components/Disclaimer';
import DietPlan from './components/DietPlan';
import RecipeBuilder from './components/RecipeBuilder';
import Analytics from './components/Analytics';
import { Dashboard } from './components/pages';
import ChatPage from './components/ChatPage';
import ConfirmSheet from './components/ConfirmSheet';
import UndoToast from './components/UndoToast';
import PWAInstall from './components/PWAInstall';
import FeedbackForm from './components/FeedbackForm';

const INITIAL_FORM: OnboardingFormData = {
  referralSource: '', previousApps: '', painPoints: [], accomplishment: '',
  name: '', weight: '', height: '', age: '', gender: '',
  goal: '', dietType: '', activityLevel: '',
};

const NAV_ITEMS = [
  { path: '/', icon: Home, labelKey: 'Dashboard' },
  { path: '/analytics', icon: BarChart3, labelKey: 'Progress' },
  { path: '/plan', icon: Calendar, labelKey: 'Plan' },
  { path: '/chat', icon: MessageSquare, labelKey: 'Coach' },
  { path: '/profile', icon: User, labelKey: 'Profile' },
];

function AppContent() {
  const auth = useAuth();
  const nutrition = useNutrition(auth.userId, auth.goals);
  const coach = useCoach(auth.userId, auth.userProfile, auth.goals, nutrition.totals, nutrition.todayEntries);
  const weight = useWeight(auth.userId);
  const exercise = useExercise(auth.userId);
  const favorites = useFavorites(auth.userId);
  const recipes = useRecipes(auth.userId, nutrition.addManualEntry);
  const water = useWater(auth.userId);
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(0);
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ weight: '', height: '', age: '', goal: '', dietType: '' });

  const handleOnboarding = async () => {
    try {
      // Phase 1: Pre-survey screens (0-4) — just advance
      if (onboardingStep < 5) {
        setOnboardingStep((onboardingStep + 1) as OnboardingStep);
        return;
      }
      // Phase 2: Body data screens (5-7)
      if (onboardingStep === 5 && formData.name && formData.weight && formData.height && formData.age && formData.gender) {
        const safeName = sanitizeText(formData.name.trim());
        if (!safeName) { nutrition.setErrorMsg('Please enter a valid name.'); return; }
        if (!isValidWeight(formData.weight)) { nutrition.setErrorMsg('Please enter a valid weight (20-300 kg).'); return; }
        if (!isValidHeight(formData.height)) { nutrition.setErrorMsg('Please enter a valid height (50-250 cm).'); return; }
        if (!isValidAge(formData.age)) { nutrition.setErrorMsg('Please enter a valid age (10-120).'); return; }
        setFormData({ ...formData, name: safeName });
        setOnboardingStep(6);
      } else if (onboardingStep === 6 && formData.goal && formData.activityLevel) {
        setOnboardingStep(7);
      } else if (onboardingStep === 7 && formData.dietType) {
        await auth.saveUserProfile({ ...formData, gender: formData.gender as UserProfile['gender'] });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      nutrition.setErrorMsg('Could not save your profile. ' + message);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.userProfile) return;
    if (!isValidWeight(profileForm.weight) || !isValidHeight(profileForm.height) || !isValidAge(profileForm.age)) {
      nutrition.setErrorMsg('Please enter valid values.');
      return;
    }
    await auth.saveUserProfile({
      ...auth.userProfile,
      weight: String(clampNumber(profileForm.weight, 20, 300)),
      height: String(clampNumber(profileForm.height, 50, 250)),
      age: String(clampNumber(profileForm.age, 10, 120)),
      goal: profileForm.goal || auth.userProfile.goal,
      dietType: profileForm.dietType || auth.userProfile.dietType,
    });
    setEditingProfile(false);
  };

  const startEditProfile = () => {
    if (auth.userProfile) {
      setProfileForm({
        weight: auth.userProfile.weight,
        height: auth.userProfile.height,
        age: auth.userProfile.age,
        goal: auth.userProfile.goal,
        dietType: auth.userProfile.dietType,
      });
    }
    setEditingProfile(true);
  };

  // LOADING
  if (auth.authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-muted)] text-sm">
        {t('loading')}
      </div>
    );
  }

  // SIGNED OUT
  if (!auth.userId) {
    return <AuthScreen />;
  }

  // ONBOARDING
  if (!auth.userProfile) {
    return (
      <Onboarding
        formData={formData}
        setFormData={setFormData}
        step={onboardingStep}
        onNext={handleOnboarding}
        onBack={() => setOnboardingStep((s) => (Math.max(0, s - 1) as OnboardingStep))}
      />
    );
  }

  // MAIN APP
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]" style={{ fontFamily: 'system-ui' }}>
        {/* Meal Logged Popup */}
        {nutrition.showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => nutrition.setShowSuccess(false)}>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 mx-6 max-w-xs w-full shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Meal Logged</h3>
              <p className="text-sm text-[var(--text-muted)] mb-5">Your meal has been added successfully</p>
              <button
                onClick={() => nutrition.setShowSuccess(false)}
                className="w-full py-3 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Undo Toast */}
        {nutrition.pendingUndo && (
          <UndoToast
            message={nutrition.pendingUndo === 'delete' ? 'Meal deleted' : "Today's meals cleared"}
            onUndo={nutrition.pendingUndo === 'delete' ? nutrition.undoDelete : nutrition.undoReset}
            onDismiss={nutrition.clearUndo}
          />
        )}

        {/* Reset Confirm */}
        {showResetConfirm && (
          <ConfirmSheet
            title="Reset today?"
            message="This will remove all meals logged today. You can undo within 5 seconds."
            confirmLabel="Reset"
            danger
            onConfirm={() => { setShowResetConfirm(false); nutrition.resetDay(); }}
            onCancel={() => setShowResetConfirm(false)}
          />
        )}

        {/* HEADER */}
        <header className="header-gradient-border sticky top-0 bg-[var(--bg-base)]/90 backdrop-blur-xl z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-base sm:text-lg font-bold tracking-tight shimmer-text hover:opacity-80 transition-opacity" style={{ fontFamily: "'Georgia', serif" }}>
                {t('appName')}
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link group relative flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all duration-200 ${
                        isActive
                          ? 'nav-active font-bold text-accent'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`
                    }
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.labelKey}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline"><ExportButton entries={nutrition.entries} weightEntries={weight.entries} userName={auth.userProfile.name} /></span>
              <LanguageToggle />
              <ThemeToggle />
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="hidden md:flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span>{auth.userProfile.name}</span>
              </button>
              <button onClick={() => setShowFeedback(true)} className="hidden sm:flex tap-target text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors" title="Send Feedback">
                <MessageSquareWarning className="w-4 h-4" />
              </button>
              <button onClick={() => setShowResetConfirm(true)} className="hidden sm:flex tap-target text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
              >
                {t('signOut')}
              </button>
              <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden tap-target text-[var(--text-muted)]">
                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mobileNav && (
            <div className="md:hidden border-t border-[var(--border-color)]">
              <nav className="px-3 sm:px-6 py-2 sm:py-3 flex gap-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileNav(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors flex-1 justify-center ${
                        isActive ? 'bg-accent/10 text-accent font-bold' : 'text-[var(--text-muted)]'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                  </NavLink>
                ))}
              </nav>
              <div className="px-3 pb-3 flex gap-2">
                <button
                  onClick={() => { setShowFeedback(true); setMobileNav(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <MessageSquareWarning className="w-3.5 h-3.5" />
                  {'Feedback'}
                </button>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('signOut')}
                </button>
              </div>
            </div>
          )}

          {showProfile && (
            <div className="border-t border-[var(--border-color)] bg-[var(--bg-card)]">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">{t('weightLabel')}</p>
                  <p className="text-sm text-[var(--text-primary)]">{auth.userProfile.weight} kg</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">{t('heightLabel')}</p>
                  <p className="text-sm text-[var(--text-primary)]">{auth.userProfile.height} cm</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">{t('goalLabel')}</p>
                  <p className="text-sm text-[var(--text-primary)] capitalize">{auth.userProfile.goal.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">{t('dietLabel')}</p>
                  <p className="text-sm text-[var(--text-primary)] capitalize">{auth.userProfile.dietType}</p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* MAIN CONTENT with page transition */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-page-in" key={location.pathname}>
          <Routes>
            <Route path="/" element={
              <Dashboard auth={auth} nutrition={nutrition} coach={coach} weight={weight} favorites={favorites} recipes={recipes} exercise={exercise} water={water} />
            } />
            <Route path="/analytics" element={
              <div>
                {(nutrition.entries.length > 0 || water.weeklyData.some(w => w.litres > 0)) ? (
                  <Analytics
                    entries={nutrition.entries}
                    goals={auth.goals}
                    waterData={water.weeklyData}
                    stepsData={(() => {
                      const data: { date: string; steps: number; label: string }[] = [];
                      for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const dateStr = d.toISOString().split('T')[0];
                        const key = `nutrivision-steps-${dateStr}`;
                        const steps = parseInt(localStorage.getItem(key) || '0');
                        data.push({
                          date: dateStr,
                          steps,
                          label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                        });
                      }
                      return data;
                    })()}
                  />
                ) : (
                  <div className="text-center py-20 border border-dashed border-[var(--border-color)] rounded-xl">
                    <p className="text-[var(--text-muted)] text-sm">Start logging meals to see your progress.</p>
                  </div>
                )}
              </div>
            } />
            <Route path="/plan" element={
              <div className="space-y-8">
                <RecipeBuilder
                  recipes={recipes.recipes}
                  onCreate={recipes.createRecipe}
                  onDelete={recipes.deleteRecipe}
                  onLog={recipes.logRecipe}
                />
                {coach.dietPlan && <DietPlan plan={coach.dietPlan} />}
                {!coach.dietPlan && (
                  <button
                    onClick={coach.generateDietPlan}
                    disabled={coach.loadingDietPlan}
                    className="w-full flex items-center justify-center gap-3 border border-[var(--border-color)] hover:border-[var(--accent)] rounded-lg px-5 py-6 transition-colors"
                  >
                    <span className="text-accent text-lg">*</span>
                    <span className="text-sm text-[var(--text-primary)]">
                      {coach.loadingDietPlan ? t('buildingPlan') : t('mealPlan')}
                    </span>
                    {coach.loadingDietPlan && (
                      <div className="w-4 h-4 border-2 border-[var(--border-color)] border-t-[var(--accent)] rounded-full animate-spin" />
                    )}
                  </button>
                )}
              </div>
            } />
            <Route path="/chat" element={
              <ChatPage
                chatHistory={coach.chatHistory}
                chatLoading={coach.chatLoading}
                chatMessage={coach.chatMessage}
                setChatMessage={coach.setChatMessage}
                onSend={coach.sendChatMessage}
              />
            } />
            <Route path="/profile" element={
              <div className="space-y-6">
                <div className="border border-[var(--border-color)] rounded-xl p-6 bg-[var(--bg-card)]/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">Profile</h2>
                    {!editingProfile && (
                      <button onClick={startEditProfile} className="text-xs text-accent hover:underline font-bold">Edit</button>
                    )}
                  </div>

                  {editingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('weightLabel')} (kg)</label>
                          <input type="number" value={profileForm.weight} onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                            className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 tabular-nums" />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('heightLabel')} (cm)</label>
                          <input type="number" value={profileForm.height} onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                            className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 tabular-nums" />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('ageLabel')}</label>
                          <input type="number" value={profileForm.age} onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                            className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 tabular-nums" />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('goalLabel')}</label>
                          <select value={profileForm.goal} onChange={(e) => setProfileForm({ ...profileForm, goal: e.target.value })}
                            className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50">
                            <option value="weight-loss">Weight Loss</option>
                            <option value="weight-gain">Weight Gain</option>
                            <option value="muscle-gain">Muscle Gain</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="healthy-eating">Healthy Eating</option>
                            <option value="athletic-performance">Performance</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('dietLabel')}</label>
                          <select value={profileForm.dietType} onChange={(e) => setProfileForm({ ...profileForm, dietType: e.target.value })}
                            className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50">
                            <option value="vegetarian">Vegetarian</option>
                            <option value="non-vegetarian">Non-Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="pescatarian">Pescatarian</option>
                            <option value="keto">Keto</option>
                            <option value="paleo">Paleo</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setEditingProfile(false)} className="flex-1 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-muted)]">Cancel</button>
                        <button onClick={handleSaveProfile} className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent-dim transition-colors">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase text-[var(--text-muted)]">{t('weightLabel')}</p>
                        <p className="text-lg font-bold tabular-nums">{auth.userProfile.weight} kg</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase text-[var(--text-muted)]">{t('heightLabel')}</p>
                        <p className="text-lg font-bold tabular-nums">{auth.userProfile.height} cm</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase text-[var(--text-muted)]">{t('goalLabel')}</p>
                        <p className="text-lg font-bold capitalize">{auth.userProfile.goal.replace('-', ' ')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase text-[var(--text-muted)]">Age</p>
                        <p className="text-lg font-bold tabular-nums">{auth.userProfile.age}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Health Stats Card */}
                <div className="border border-[var(--border-color)] rounded-xl p-6 bg-[var(--bg-card)]/50">
                  <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Health Stats</h2>
                  {(() => {
                    const calc = calculateAllGoals(auth.userProfile);
                    return (
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="bg-[var(--bg-base)] rounded-xl p-3 sm:p-4 text-center">
                          <p className="text-xl sm:text-2xl font-bold text-[var(--accent)]">{calc.bmi}</p>
                          <p className="text-[9px] sm:text-[10px] uppercase text-[var(--text-muted)] mt-1">BMI</p>
                          <p className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] mt-0.5">{calc.bmiCategory}</p>
                        </div>
                        <div className="bg-[var(--bg-base)] rounded-xl p-3 sm:p-4 text-center">
                          <p className="text-xl sm:text-2xl font-bold text-[var(--accent)]">{calc.bmr}</p>
                          <p className="text-[9px] sm:text-[10px] uppercase text-[var(--text-muted)] mt-1">BMR</p>
                          <p className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] mt-0.5">kcal/day</p>
                        </div>
                        <div className="bg-[var(--bg-base)] rounded-xl p-3 sm:p-4 text-center">
                          <p className="text-xl sm:text-2xl font-bold text-[var(--accent)]">{calc.tdee}</p>
                          <p className="text-[9px] sm:text-[10px] uppercase text-[var(--text-muted)] mt-1">TDEE</p>
                          <p className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] mt-0.5">kcal/day</p>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center">Based on Mifflin-St Jeor formula</p>
                </div>
                <Disclaimer />
              </div>
            } />
          </Routes>
        </main>

        <footer className="border-t border-[var(--border-color)] mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between">
            <p className="text-[var(--text-muted)] text-xs">{t('appName')}</p>
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] text-xs transition-colors"
            >
              <MessageSquareWarning className="w-3.5 h-3.5" />
              <span>Feedback</span>
            </button>
          </div>
        </footer>

        {/* Feedback Form */}
        {showFeedback && (
          <FeedbackForm
            userId={auth.userId!}
            userName={auth.userProfile?.name}
            onClose={() => setShowFeedback(false)}
          />
        )}

        {/* PWA Install */}
        <PWAInstall />
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return <AppContent />;
}
