import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import type { OnboardingFormData, OnboardingStep } from '../types';
import {
  REFERRAL_OPTIONS, PAIN_POINT_OPTIONS, ACCOMPLISHMENT_OPTIONS,
  GOAL_OPTIONS, ACTIVITY_OPTIONS, DIET_OPTIONS,
} from '../types';
import Disclaimer from './Disclaimer';
import ThemeToggle from './ThemeToggle';
import { sanitizeText, clampNumber, isValidWeight, isValidHeight, isValidAge, isValidGender, isValidGoal, isValidActivityLevel, isValidDietType } from '../utils/validation';
import { calculateAllGoals } from '../utils/calculateGoals';

const TOTAL_SCREENS = 8;

interface OnboardingProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  step: OnboardingStep;
  onNext: () => void;
  onBack: () => void;
}

export default function Onboarding({ formData, setFormData, step, onNext, onBack }: OnboardingProps) {
  const canProceed =
    // Phase 1: Pre-survey
    (step === 0 && !!formData.referralSource) ||
    (step === 1 && !!formData.previousApps) ||
    (step === 2 && formData.painPoints.length > 0) ||
    (step === 3 && !!formData.accomplishment) ||
    (step === 4) || // Thank you screen — always allowed
    // Phase 2: Body data
    (step === 5 && formData.name && formData.weight && formData.height && formData.age && formData.gender) ||
    (step === 6 && formData.goal && formData.activityLevel) ||
    (step === 7 && !!formData.dietType);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col text-[var(--text-primary)] relative">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div className="absolute top-6 left-6 z-10">
        {step > 0 && step !== 4 && (
          <button onClick={onBack} className="p-2 rounded-full hover:bg-[var(--bg-card)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="pt-16 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex gap-1 mb-1">
            {Array.from({ length: TOTAL_SCREENS }, (_, i) => (
              <div
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-[var(--text-primary)]' : 'bg-[var(--bg-card)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="max-w-md w-full">
          {/* ===== SCREEN 0: Referral Source ===== */}
          {step === 0 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                Where did you hear about us?
              </h1>
              <div className="space-y-3">
                {REFERRAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, referralSource: opt.id })}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                      formData.referralSource === opt.id
                        ? 'border-[var(--text-primary)] bg-[var(--bg-card)]'
                        : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{opt.icon}</span>
                    <span className="flex-1 text-left text-sm font-semibold">{opt.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.referralSource === opt.id
                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)]'
                        : 'border-[var(--text-muted)]'
                    }`}>
                      {formData.referralSource === opt.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== SCREEN 1: Previous Apps ===== */}
          {step === 1 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                Have you tried other calorie tracking apps?
              </h1>
              <div className="space-y-3">
                {[
                  { id: 'yes', label: 'Yes', icon: '👍' },
                  { id: 'no', label: 'No', icon: '👎' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, previousApps: opt.id })}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                      formData.previousApps === opt.id
                        ? 'border-[var(--text-primary)] bg-[var(--bg-card)]'
                        : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{opt.icon}</span>
                    <span className="flex-1 text-left text-sm font-semibold">{opt.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.previousApps === opt.id
                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)]'
                        : 'border-[var(--text-muted)]'
                    }`}>
                      {formData.previousApps === opt.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== SCREEN 2: Pain Points (MULTI-SELECT) ===== */}
          {step === 2 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                What's stopping you from reaching your goals?
              </h1>
              <div className="space-y-3">
                {PAIN_POINT_OPTIONS.map((opt) => {
                  const selected = formData.painPoints.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        const updated = selected
                          ? formData.painPoints.filter((p) => p !== opt.id)
                          : [...formData.painPoints, opt.id];
                        setFormData({ ...formData, painPoints: updated });
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                        selected
                          ? 'border-[var(--text-primary)] bg-[var(--bg-card)]'
                          : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                      }`}
                    >
                      <span className="text-xl w-8 text-center">{opt.icon}</span>
                      <span className="flex-1 text-left text-sm font-semibold">{opt.label}</span>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        selected
                          ? 'border-[var(--text-primary)] bg-[var(--text-primary)]'
                          : 'border-[var(--text-muted)]'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {formData.painPoints.length > 0 && (
                <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
                  {formData.painPoints.length} selected — choose as many as apply
                </p>
              )}
            </div>
          )}

          {/* ===== SCREEN 3: Accomplishment ===== */}
          {step === 3 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                What would you like to accomplish?
              </h1>
              <div className="space-y-3">
                {ACCOMPLISHMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, accomplishment: opt.id })}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                      formData.accomplishment === opt.id
                        ? 'border-[var(--text-primary)] bg-[var(--bg-card)]'
                        : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{opt.icon}</span>
                    <span className="flex-1 text-left text-sm font-semibold">{opt.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.accomplishment === opt.id
                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)]'
                        : 'border-[var(--text-muted)]'
                    }`}>
                      {formData.accomplishment === opt.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== SCREEN 4: Thank You ===== */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-36 h-36 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <span className="text-6xl">🤝</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                Thank you for trusting us!
              </h1>
              <p className="text-[var(--text-muted)] text-base mb-6">
                Now let's personalize NutriVision for you...
              </p>
              <div className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full px-4 py-2">
                <span className="text-sm">🎯</span>
                <span className="text-xs font-semibold">Personalized to your goals</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-4 max-w-xs mx-auto">
                We'll use your answers to tailor your plan, targets, and recommendations.
              </p>
            </div>
          )}

          {/* ===== SCREEN 5: Body Data — Name, Weight, Height, Age, Gender ===== */}
          {step === 5 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                A little about you.
              </h1>
              <p className="text-[var(--text-muted)] text-sm mb-6">This helps us calculate your daily targets.</p>
              <div className="space-y-5" style={{ fontFamily: 'system-ui' }}>
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-2 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent)] px-0 py-3 text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] mb-2 block">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="70"
                      className="w-full bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent)] px-0 py-3 text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] mb-2 block">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="170"
                      className="w-full bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent)] px-0 py-3 text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] mb-2 block">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="28"
                      className="w-full bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent)] px-0 py-3 text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] mb-2 block">Gender</label>
                    <div className="flex gap-4 pt-3.5">
                      {(['male', 'female'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`text-sm capitalize pb-2 border-b transition-colors ${
                            formData.gender === g
                              ? 'text-[var(--accent)] border-[var(--accent)]'
                              : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Age and gender are used only for the BMR calculation — never shown or shared.
                </p>
              </div>
            </div>
          )}

          {/* ===== SCREEN 6: Goal + Activity Level ===== */}
          {step === 6 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                What are you working toward?
              </h1>
              <p className="text-[var(--text-muted)] text-sm mb-6">Your plan will be built around this.</p>
              <div className="space-y-8" style={{ fontFamily: 'system-ui' }}>
                <div className="space-y-2">
                  {GOAL_OPTIONS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setFormData({ ...formData, goal: g.id })}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        formData.goal === g.id
                          ? 'border-[var(--accent)]/60 bg-accent/5'
                          : 'border-[var(--border-color)] hover:border-[var(--accent)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${formData.goal === g.id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                          {g.label}
                        </span>
                        {formData.goal === g.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{g.desc}</p>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-3 block">Activity level</label>
                  <div className="space-y-2">
                    {ACTIVITY_OPTIONS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setFormData({ ...formData, activityLevel: a.id })}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                          formData.activityLevel === a.id
                            ? 'border-[var(--accent)]/60 bg-accent/5'
                            : 'border-[var(--border-color)] hover:border-[var(--accent)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${formData.activityLevel === a.id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                            {a.label}
                          </span>
                          {formData.activityLevel === a.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{a.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SCREEN 7: Diet Type + Targets Preview ===== */}
          {step === 7 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                How do you like to eat?
              </h1>
              <p className="text-[var(--text-muted)] text-sm mb-6">Meal plans and suggestions will respect this.</p>
              <div className="space-y-6" style={{ fontFamily: 'system-ui' }}>
                <div className="grid grid-cols-2 gap-2">
                  {DIET_OPTIONS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setFormData({ ...formData, dietType: d.id })}
                      className={`text-left px-4 py-4 rounded-lg border transition-all ${
                        formData.dietType === d.id
                          ? 'border-[var(--accent)]/60 bg-accent/5'
                          : 'border-[var(--border-color)] hover:border-[var(--accent)]'
                      }`}
                    >
                      <span className={`text-sm font-bold ${formData.dietType === d.id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                        {d.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Calculated Targets Preview */}
                {formData.weight && formData.height && formData.age && formData.gender && formData.goal && formData.activityLevel && (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold mb-3">Your daily targets</p>
                    {(() => {
                      const calc = calculateAllGoals(formData);
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[var(--bg-base)] rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-[var(--accent)]">{calc.calories}</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase">Calories</p>
                          </div>
                          <div className="bg-[var(--bg-base)] rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-[var(--accent)]">{calc.protein}g</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase">Protein</p>
                          </div>
                          <div className="bg-[var(--bg-base)] rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-[var(--accent)]">{calc.carbs}g</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase">Carbs</p>
                          </div>
                          <div className="bg-[var(--bg-base)] rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-[var(--accent)]">{calc.fat}g</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase">Fat</p>
                          </div>
                        </div>
                      );
                    })()}
                    <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center">Calculated using Mifflin-St Jeor formula based on your profile</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== Continue Button ===== */}
          <div className="mt-8 mb-6">
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`w-full py-4 rounded-2xl text-sm font-bold transition-all ${
                canProceed
                  ? 'bg-[var(--text-primary)] text-white hover:opacity-90'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 7 ? 'Enter' : step === 4 ? 'Continue' : 'Continue'}
            </button>
          </div>

          {step !== 4 && <Disclaimer />}
        </div>
      </div>
    </div>
  );
}
