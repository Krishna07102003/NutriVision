import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  progress: number;
  status: string;
  gender?: string;
}

export default function LoadingScreen({ progress, status, gender }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  // Animated dots for status text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const isFemale = gender === 'female';

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6">
      {/* Animated Workout Character */}
      <div className="relative w-40 h-40 mb-8">
        {/* Character Container */}
        <div className={`absolute inset-0 flex items-center justify-center ${isFemale ? 'animate-pulse-female' : 'animate-pulse-male'}`}>
          {isFemale ? (
            // Female character - yoga/running
            <div className="relative">
              <div className="text-7xl animate-bounce-slow">🧘‍♀️</div>
              {/* Animated sparkles */}
              <div className="absolute -top-2 -right-2 text-yellow-400 animate-sparkle">✨</div>
              <div className="absolute -bottom-1 -left-2 text-pink-400 animate-sparkle-delay">✨</div>
              <div className="absolute top-0 -left-4 text-blue-400 animate-pulse">💪</div>
            </div>
          ) : (
            // Male character - weightlifting
            <div className="relative">
              <div className="text-7xl animate-bounce-slow">🏋️</div>
              {/* Animated sparkles */}
              <div className="absolute -top-2 -right-2 text-yellow-400 animate-sparkle">✨</div>
              <div className="absolute -bottom-1 -left-2 text-orange-400 animate-sparkle-delay">✨</div>
              <div className="absolute top-0 -left-4 text-red-400 animate-pulse">💪</div>
            </div>
          )}
        </div>

        {/* Circular glow effect */}
        <div className={`absolute inset-0 rounded-full ${isFemale ? 'bg-pink-500/10' : 'bg-orange-500/10'} blur-2xl animate-pulse`} />
      </div>

      {/* App Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] rounded-lg flex items-center justify-center">
            <span className="text-[var(--accent)] font-bold text-sm">N</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] text-center" style={{ fontFamily: "'Georgia', serif" }}>
          NutriVision
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${isFemale
              ? 'bg-gradient-to-r from-pink-400 to-rose-500'
              : 'bg-gradient-to-r from-orange-400 to-amber-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-[var(--text-muted)]">{status}{dots}</span>
          <span className={`text-sm font-bold tabular-nums ${isFemale ? 'text-pink-400' : 'text-orange-400'}`}>
            {Math.round(Math.min(progress, 100))}%
          </span>
        </div>
      </div>

      {/* Motivational text */}
      <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
        {progress < 30 && "Getting things ready for you..."}
        {progress >= 30 && progress < 60 && "Loading your nutrition data..."}
        {progress >= 60 && progress < 90 && "Almost there..."}
        {progress >= 90 && "Starting up!"}
      </p>
    </div>
  );
}
