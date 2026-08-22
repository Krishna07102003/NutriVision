import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { OnboardingFormData, OnboardingStep } from '../types';
import { GOAL_OPTIONS, ACTIVITY_OPTIONS, DIET_OPTIONS } from '../types';
import Disclaimer from './Disclaimer';
import ThemeToggle from './ThemeToggle';
import { sanitizeText, clampNumber, isValidWeight, isValidHeight, isValidAge, isValidGender, isValidGoal, isValidActivityLevel, isValidDietType } from '../utils/validation';
import { calculateAllGoals } from '../utils/calculateGoals';

interface OnboardingProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  step: OnboardingStep;
  onNext: () => void;
  onBack: () => void;
}

export default function Onboarding({ formData, setFormData, step, onNext, onBack }: OnboardingProps) {
  const canProceed =
    (step === 0 && formData.name && formData.weight && formData.height && formData.age && formData.gender) ||
    (step === 1 && formData.goal && formData.activityLevel) ||
    (step === 2 && !!formData.dietType);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col text-[var(--text-primary)] relative" style={{ fontFamily: "'Georgia', serif" }}>
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-[2px] flex-1 rounded-full transition-all duration-500 ${
                    i <= step ? 'bg-accent' : 'bg-[var(--bg-card)]'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-3" style={{ fontFamily: 'system-ui' }}>
              Step {step + 1} of 3
            </p>
            <h1 className="text-4xl font-bold leading-tight mb-2">
              {step === 0 && 'A little about you.'}
              {step === 1 && 'What are you working toward?'}
              {step === 2 && 'How do you like to eat?'}
            </h1>
            <p className="text-[var(--text-muted)] text-sm" style={{ fontFamily: 'system-ui' }}>
              {step === 0 && 'This helps us calculate your daily targets.'}
              {step === 1 && 'Your plan will be built around this.'}
              {step === 2 && 'Meal plans and suggestions will respect this.'}
            </p>
          </div>

          <div style={{ fontFamily: 'system-ui' }}>
            {step === 0 && (
              <div className="space-y-5">
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
                              ? 'text-amber-200 border-[var(--accent)]'
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
                  Age and gender are used only for the BMR calculation (Mifflin-St Jeor formula) — never shown or shared.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
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
                        <span
                          className={`text-sm font-bold ${
                            formData.goal === g.id ? 'text-amber-200' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {g.label}
                        </span>
                        {formData.goal === g.id && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
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
                          <span
                            className={`text-sm font-bold ${formData.activityLevel === a.id ? 'text-amber-200' : 'text-[var(--text-primary)]'}`}
                          >
                            {a.label}
                          </span>
                          {formData.activityLevel === a.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{a.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
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
                      <span
                        className={`text-sm font-bold ${
                          formData.dietType === d.id ? 'text-amber-200' : 'text-[var(--text-primary)]'
                        }`}
                      >
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
            )}

            <div className="mt-10 mb-8 flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm transition-colors px-4 py-3"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                onClick={onNext}
                disabled={!canProceed}
                className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3.5 rounded-lg text-sm font-bold hover:bg-accent-dim disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)] transition-colors"
              >
                {step === 2 ? 'Enter' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <Disclaimer />
          </div>
        </div>
      </div>
    </div>
  );
}
