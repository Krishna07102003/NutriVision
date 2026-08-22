export function SkeletonBar({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--bg-card)] rounded ${className}`} />
  );
}

export function SkeletonMealCard() {
  return (
    <div className="flex gap-5 border border-[var(--border-color)] rounded-xl p-5">
      <SkeletonBar className="w-20 h-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBar className="h-4 w-32" />
        <SkeletonBar className="h-3 w-20" />
        <div className="flex gap-4 pt-2">
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMacroDonut() {
  return (
    <div className="flex flex-col items-center gap-2">
      <SkeletonBar className="w-[100px] h-[100px] rounded-full" />
      <SkeletonBar className="h-2.5 w-14" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Date nav */}
      <SkeletonBar className="h-10 w-48 mx-auto" />
      {/* Macro donuts */}
      <div className="flex justify-center gap-8 p-8 border border-[var(--border-color)] rounded-xl">
        <SkeletonMacroDonut />
        <SkeletonMacroDonut />
        <SkeletonMacroDonut />
        <SkeletonMacroDonut />
      </div>
      {/* Water + Weight */}
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonBar className="h-32 rounded-xl" />
        <SkeletonBar className="h-32 rounded-xl" />
      </div>
      {/* Action buttons */}
      <div className="grid md:grid-cols-4 gap-3">
        <SkeletonBar className="h-14 rounded-lg" />
        <SkeletonBar className="h-14 rounded-lg" />
        <SkeletonBar className="h-14 rounded-lg" />
        <SkeletonBar className="h-14 rounded-lg" />
      </div>
      {/* Meal cards */}
      <SkeletonMealCard />
      <SkeletonMealCard />
      <SkeletonMealCard />
    </div>
  );
}
