import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Plus, Globe } from 'lucide-react';
import { searchFood, CATEGORIES, type FoodItem, type FoodCategory } from '../data/foodDatabase';

const searchCache = new Map<string, FoodItem[]>();
const MAX_CACHE = 50;

interface FoodSearchProps {
  onSelect: (food: FoodItem) => void;
  onManualEntry: () => void;
  onClose: () => void;
}

export default function FoodSearch({ onSelect, onManualEntry, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FoodCategory>('all');
  const [localResults, setLocalResults] = useState<FoodItem[]>([]);
  const [onlineResults, setOnlineResults] = useState<FoodItem[]>([]);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalResults(searchFood(query, category));
  }, [query, category]);

  const searchOnline = useCallback(async (q: string) => {
    if (q.length < 2) { setOnlineResults([]); return; }

    const cacheKey = q.toLowerCase().trim();
    if (searchCache.has(cacheKey)) {
      setOnlineResults(searchCache.get(cacheKey)!);
      setSearchingOnline(false);
      return;
    }

    setSearchingOnline(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) {
        setOnlineResults([]);
        setSearchingOnline(false);
        return;
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/ai/food-search?q=${encodeURIComponent(q)}`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (!res.ok) {
        setOnlineResults([]);
        setSearchingOnline(false);
        return;
      }

      const data = await res.json();
      const foods: FoodItem[] = (data.products || [])
        .filter((p: any) => p.nutriments && p.product_name)
        .map((p: any) => ({
          name: `${p.product_name}${p.brands ? ' (' + p.brands + ')' : ''}`,
          calories: Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal_serving'] || 0),
          protein: Math.round((p.nutriments.proteins_100g || p.nutriments.proteins_serving || 0) * 10) / 10,
          carbs: Math.round((p.nutriments.carbohydrates_100g || p.nutriments.carbohydrates_serving || 0) * 10) / 10,
          fat: Math.round((p.nutriments.fat_100g || p.nutriments.fat_serving || 0) * 10) / 10,
          serving: p.serving_size || '100g',
          category: 'packaged' as FoodCategory,
        }))
        .filter((f: FoodItem) => f.calories > 0);

      if (searchCache.size >= MAX_CACHE) {
        const firstKey = searchCache.keys().next().value;
        if (firstKey) searchCache.delete(firstKey);
      }
      searchCache.set(cacheKey, foods);
      setOnlineResults(foods);
    } catch {
      setOnlineResults([]);
    }
    setSearchingOnline(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchOnline(query), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchOnline]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const hasOnlineResults = onlineResults.length > 0;
  const hasLocalResults = localResults.length > 0;
  const noResults = !hasLocalResults && !hasOnlineResults && !searchingOnline && query.length >= 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center px-4" style={{ paddingTop: 'max(5rem, calc(env(safe-area-inset-top) + 4rem))' }} onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 3M+ foods (e.g. Maggi, Amul, Tata)"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
          <button onClick={onClose}>
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto border-b border-[var(--border-color)]" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-2 rounded-full text-xs whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-accent text-white font-bold'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
          {/* Local results */}
          {hasLocalResults && localResults.map((food, i) => (
            <button
              key={`local-${i}`}
              onClick={() => onSelect(food)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-color)] last:border-0 text-left"
            >
              <div className="min-w-0">
                <p className="text-sm text-[var(--text-primary)] font-bold truncate">{food.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{food.serving}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                <div className="text-right">
                  <p className="text-sm text-[var(--text-primary)] font-bold tabular-nums">{food.calories} cal</p>
                  <p className="text-[10px] text-[var(--text-muted)] tabular-nums">P{food.protein} C{food.carbs} F{food.fat}</p>
                </div>
                <Plus className="w-3.5 h-3.5 text-accent" />
              </div>
            </button>
          ))}

          {/* Online results header */}
          {hasOnlineResults && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-hover)]">
              <Globe className="w-3 h-3 text-accent" />
              <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold">From OpenFoodFacts</span>
            </div>
          )}

          {/* Online results */}
          {onlineResults.map((food, i) => (
            <button
              key={`online-${i}`}
              onClick={() => onSelect(food)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-color)] last:border-0 text-left"
            >
              <div className="min-w-0">
                <p className="text-sm text-[var(--text-primary)] font-bold truncate">{food.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{food.serving}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                <div className="text-right">
                  <p className="text-sm text-[var(--text-primary)] font-bold tabular-nums">{food.calories} cal</p>
                  <p className="text-[10px] text-[var(--text-muted)] tabular-nums">P{food.protein} C{food.carbs} F{food.fat}</p>
                </div>
                <Plus className="w-3.5 h-3.5 text-accent" />
              </div>
            </button>
          ))}

          {/* Loading spinner */}
          {searchingOnline && (
            <div className="py-4 text-center">
              <div className="w-5 h-5 border-2 border-[var(--border-color)] border-t-[var(--accent)] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[var(--text-muted)] mt-2">Searching online database...</p>
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--text-muted)]">No foods found</p>
              <button onClick={onManualEntry} className="mt-3 text-sm text-accent hover:underline">
                Add manually instead
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
          <button onClick={onManualEntry} className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Add Manually
          </button>
        </div>
      </div>
    </div>
  );
}
