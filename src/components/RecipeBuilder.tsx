import { useState } from 'react';
import { ChefHat, Plus, Trash2, X, UtensilsCrossed } from 'lucide-react';
import { searchFood, type FoodItem } from '../data/foodDatabase';
import { sanitizeText, clampNumber } from '../utils/validation';
import type { Recipe, RecipeIngredient } from '../types';

interface RecipeBuilderProps {
  recipes: Recipe[];
  onCreate: (name: string, ingredients: RecipeIngredient[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onLog: (recipe: Recipe) => Promise<void>;
}

export default function RecipeBuilder({ recipes, onCreate, onDelete, onLog }: RecipeBuilderProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 0) {
      setSearchResults(searchFood(q).slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const addIngredient = (food: FoodItem) => {
    const existing = ingredients.find((i) => i.name === food.name);
    if (existing) {
      setIngredients((prev) =>
        prev.map((i) => i.name === food.name ? { ...i, quantity: i.quantity + 1 } : i)
      );
    } else {
      setIngredients((prev) => [
        ...prev,
        { name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, serving: food.serving, quantity: 1 },
      ]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateQuantity = (index: number, qty: number) => {
    if (qty < 1) return;
    setIngredients((prev) => prev.map((i, idx) => idx === index ? { ...i, quantity: qty } : i));
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreate = async () => {
    const safeName = sanitizeText(recipeName.trim());
    if (!safeName || ingredients.length === 0) return;
    // Sanitize all ingredient quantities
    const safeIngredients = ingredients.map((ing) => ({
      ...ing,
      name: sanitizeText(ing.name),
      quantity: clampNumber(String(ing.quantity), 0.1, 100),
      calories: clampNumber(String(ing.calories), 0, 4999),
      protein: clampNumber(String(ing.protein), 0, 500),
      carbs: clampNumber(String(ing.carbs), 0, 1000),
      fat: clampNumber(String(ing.fat), 0, 500),
    }));
    await onCreate(safeName, safeIngredients);
    setRecipeName('');
    setIngredients([]);
    setShowCreate(false);
  };

  const totals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories * ing.quantity,
      protein: acc.protein + ing.protein * ing.quantity,
      carbs: acc.carbs + ing.carbs * ing.quantity,
      fat: acc.fat + ing.fat * ing.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-accent" />
          <span className="text-sm text-[var(--text-primary)] font-bold">My Recipes</span>
          {recipes.length > 0 && (
            <span className="text-xs text-[var(--text-muted)]">({recipes.length})</span>
          )}
        </div>
        <Plus className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showCreate ? 'rotate-45' : ''}`} />
      </button>

      {/* Create Form */}
      {showCreate && (
        <div className="px-5 pb-5 border-t border-[var(--border-color)]">
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Recipe name (e.g. My Breakfast)"
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50"
            />
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search food to add..."
                className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50"
              />
              {searchResults.length > 0 && (
                <div className="mt-1 bg-[var(--bg-card)] rounded-lg overflow-hidden">
                  {searchResults.map((food, i) => (
                    <button
                      key={i}
                      onClick={() => addIngredient(food)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-hover)][var(--bg-hover)] transition-colors text-left"
                    >
                      <span className="text-sm text-[var(--text-primary)]">{food.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">{food.calories} cal</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients list */}
            {ingredients.length > 0 && (
              <div className="space-y-1.5">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-[var(--bg-card)] rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--text-primary)] font-bold truncate">{ing.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{Math.round(ing.calories * ing.quantity)} cal total</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => updateQuantity(i, ing.quantity - 1)} className="w-6 h-6 rounded border border-[var(--border-color)] flex items-center justify-center text-xs text-[var(--text-muted)]">-</button>
                      <span className="text-sm text-[var(--text-primary)] font-bold tabular-nums w-6 text-center">{ing.quantity}</span>
                      <button onClick={() => updateQuantity(i, ing.quantity + 1)} className="w-6 h-6 rounded border border-[var(--border-color)] flex items-center justify-center text-xs text-[var(--text-muted)]">+</button>
                      <button onClick={() => removeIngredient(i)} className="ml-1">
                        <X className="w-3 h-3 text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                ))}
                {/* Totals */}
                <div className="flex justify-between px-3 py-2 bg-accent/10 rounded-lg">
                  <span className="text-xs text-[var(--text-muted)] font-bold">Total ({ingredients.length} items)</span>
                  <span className="text-xs text-[var(--text-primary)] font-bold tabular-nums">
                    {Math.round(totals.calories)} cal · P{Math.round(totals.protein)}g · C{Math.round(totals.carbs)}g · F{Math.round(totals.fat)}g
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={!recipeName.trim() || ingredients.length === 0}
              className="w-full bg-accent hover:bg-accent-dim disabled:bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm font-bold py-2.5 rounded-lg transition-colors"
            >
              Save Recipe
            </button>
          </div>
        </div>
      )}

      {/* Saved Recipes */}
      {recipes.length > 0 && (
        <div className="px-5 pb-4 space-y-2">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="flex items-center justify-between py-3 border-t border-[var(--border-color)] first:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--text-primary)] font-bold">{recipe.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] tabular-nums">
                  {recipe.totalCalories} cal · P{recipe.totalProtein}g · {recipe.ingredients.length} ingredients
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onLog(recipe)}
                  className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold rounded-lg transition-colors"
                >
                  Log
                </button>
                <button onClick={() => onDelete(recipe.id)} className="text-[var(--text-muted)] hover:text-[var(--text-muted)] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {recipes.length === 0 && !showCreate && (
        <div className="px-5 pb-4">
          <p className="text-xs text-[var(--text-muted)] text-center py-2">No recipes yet. Create one to log meals faster!</p>
        </div>
      )}
    </div>
  );
}
