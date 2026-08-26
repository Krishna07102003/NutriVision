import { useState, useEffect, useCallback } from 'react';

interface LoadingState {
  progress: number;
  status: string;
  isLoading: boolean;
}

interface LoadingStage {
  key: string;
  label: string;
  weight: number;
}

const LOADING_STAGES: LoadingStage[] = [
  { key: 'profile', label: 'Loading your profile', weight: 20 },
  { key: 'nutrition', label: 'Loading meals', weight: 30 },
  { key: 'water', label: 'Loading water data', weight: 15 },
  { key: 'exercise', label: 'Loading exercise data', weight: 15 },
  { key: 'weight', label: 'Loading weight history', weight: 10 },
  { key: 'recipes', label: 'Loading recipes', weight: 10 },
];

export function useLoadingProgress() {
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({});
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());

  const updateStageProgress = useCallback((stageKey: string, progress: number) => {
    setStageProgress(prev => ({ ...prev, [stageKey]: progress }));
  }, []);

  const completeStage = useCallback((stageKey: string) => {
    setCompletedStages(prev => new Set([...prev, stageKey]));
    setStageProgress(prev => ({ ...prev, [stageKey]: 100 }));
  }, []);

  // Calculate total progress
  const totalProgress = LOADING_STAGES.reduce((total, stage) => {
    const stageProgressValue = completedStages.has(stage.key)
      ? 100
      : (stageProgress[stage.key] || 0);
    return total + (stageProgressValue * stage.weight / 100);
  }, 0);

  // Get current status text
  const currentStatus = (() => {
    // Find the first incomplete stage
    for (const stage of LOADING_STAGES) {
      if (!completedStages.has(stage.key)) {
        return stage.label;
      }
    }
    return 'Starting up';
  })();

  // Check if all loading is complete
  const isLoading = completedStages.size < LOADING_STAGES.length;

  return {
    progress: totalProgress,
    status: currentStatus,
    isLoading,
    updateStageProgress,
    completeStage,
  };
}
