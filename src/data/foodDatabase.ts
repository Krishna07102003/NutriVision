export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  category: 'indian' | 'dairy' | 'fruit' | 'vegetable' | 'grain' | 'protein' | 'snack' | 'beverage';
}

export const FOOD_DATABASE: FoodItem[] = [
  { name: 'Roti (Wheat Chapati)', calories: 70, protein: 3, carbs: 12, fat: 1.5, serving: '1 medium (30g)', category: 'indian' },
  { name: 'Plain Paratha', calories: 210, protein: 4, carbs: 28, fat: 10, serving: '1 medium (80g)', category: 'indian' },
  { name: 'Aloo Paratha', calories: 250, protein: 5, carbs: 35, fat: 10, serving: '1 medium (100g)', category: 'indian' },
  { name: 'Rice (Steamed)', calories: 130, protein: 3, carbs: 28, fat: 0.3, serving: '1 bowl (100g)', category: 'grain' },
  { name: 'Jeera Rice', calories: 160, protein: 3, carbs: 30, fat: 4, serving: '1 bowl (120g)', category: 'indian' },
  { name: 'Biryani (Veg)', calories: 210, protein: 5, carbs: 32, fat: 8, serving: '1 plate (180g)', category: 'indian' },
  { name: 'Biryani (Chicken)', calories: 250, protein: 15, carbs: 30, fat: 8, serving: '1 plate (200g)', category: 'indian' },
  { name: 'Dal (Lentils)', calories: 120, protein: 8, carbs: 18, fat: 2, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Rajma (Kidney Beans)', calories: 150, protein: 9, carbs: 22, fat: 2, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Chana Masala', calories: 170, protein: 8, carbs: 24, fat: 5, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Paneer Butter Masala', calories: 280, protein: 14, carbs: 12, fat: 20, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Palak Paneer', calories: 220, protein: 12, carbs: 10, fat: 16, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Chicken Curry', calories: 230, protein: 20, carbs: 8, fat: 14, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Butter Chicken', calories: 300, protein: 18, carbs: 10, fat: 22, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Egg Curry', calories: 180, protein: 12, carbs: 6, fat: 13, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Aloo Gobi', calories: 120, protein: 3, carbs: 18, fat: 5, serving: '1 bowl (130g)', category: 'indian' },
  { name: 'Bhindi Masala', calories: 90, protein: 2, carbs: 10, fat: 5, serving: '1 bowl (120g)', category: 'indian' },
  { name: 'Sambar', calories: 100, protein: 5, carbs: 15, fat: 2, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Rasam', calories: 40, protein: 1, carbs: 6, fat: 1, serving: '1 bowl (150g)', category: 'indian' },
  { name: 'Curd / Yogurt', calories: 60, protein: 4, carbs: 6, fat: 2, serving: '1 bowl (100g)', category: 'dairy' },
  { name: 'Raita', calories: 50, protein: 3, carbs: 5, fat: 2, serving: '1 bowl (100g)', category: 'indian' },
  { name: 'Idli (2 pieces)', calories: 120, protein: 4, carbs: 24, fat: 1, serving: '2 pieces (100g)', category: 'indian' },
  { name: 'Dosa (Plain)', calories: 130, protein: 3, carbs: 22, fat: 4, serving: '1 piece (60g)', category: 'indian' },
  { name: 'Masala Dosa', calories: 180, protein: 4, carbs: 28, fat: 6, serving: '1 piece (80g)', category: 'indian' },
  { name: 'Poha', calories: 150, protein: 3, carbs: 28, fat: 4, serving: '1 plate (150g)', category: 'indian' },
  { name: 'Upma', calories: 140, protein: 3, carbs: 24, fat: 4, serving: '1 bowl (130g)', category: 'indian' },
  { name: 'Pav Bhaji', calories: 250, protein: 5, carbs: 35, fat: 10, serving: '1 plate (200g)', category: 'indian' },
  { name: 'Vada Pav', calories: 280, protein: 6, carbs: 38, fat: 12, serving: '1 piece', category: 'indian' },
  { name: 'Samosa (1 piece)', calories: 210, protein: 4, carbs: 26, fat: 11, serving: '1 piece (60g)', category: 'snack' },
  { name: 'Chole Bhature', calories: 400, protein: 10, carbs: 50, fat: 18, serving: '1 plate', category: 'indian' },
  { name: 'Tandoori Chicken', calories: 180, protein: 22, carbs: 4, fat: 9, serving: '1 piece (100g)', category: 'protein' },
  { name: 'Chicken Tikka', calories: 190, protein: 20, carbs: 5, fat: 10, serving: '100g', category: 'protein' },
  { name: 'Egg Bhurji', calories: 170, protein: 12, carbs: 4, fat: 12, serving: '1 plate (120g)', category: 'protein' },
  { name: 'Egg Omelette (2 eggs)', calories: 150, protein: 12, carbs: 1, fat: 10, serving: '2 eggs', category: 'protein' },
  { name: 'Boiled Eggs (2)', calories: 140, protein: 12, carbs: 1, fat: 10, serving: '2 eggs', category: 'protein' },
  { name: 'Bread (Whole Wheat)', calories: 70, protein: 3, carbs: 12, fat: 1, serving: '1 slice (30g)', category: 'grain' },
  { name: 'Bread (White)', calories: 75, protein: 2, carbs: 14, fat: 1, serving: '1 slice (30g)', category: 'grain' },
  { name: 'Oats (Cooked)', calories: 150, protein: 5, carbs: 27, fat: 3, serving: '1 bowl (200g)', category: 'grain' },
  { name: 'Muesli', calories: 200, protein: 6, carbs: 34, fat: 5, serving: '1 bowl (60g)', category: 'grain' },
  { name: 'Cornflakes', calories: 100, protein: 2, carbs: 24, fat: 0.2, serving: '1 bowl (30g)', category: 'grain' },
  { name: 'Maggi / Instant Noodles', calories: 300, protein: 6, carbs: 42, fat: 12, serving: '1 pack (70g)', category: 'snack' },
  { name: 'Pasta (Cooked)', calories: 160, protein: 5, carbs: 30, fat: 2, serving: '1 plate (150g)', category: 'grain' },
  { name: 'Milk (Whole)', calories: 150, protein: 8, carbs: 12, fat: 8, serving: '1 glass (200ml)', category: 'dairy' },
  { name: 'Milk (Toned)', calories: 100, protein: 6, carbs: 12, fat: 3, serving: '1 glass (200ml)', category: 'dairy' },
  { name: 'Paneer (Cottage Cheese)', calories: 260, protein: 18, carbs: 4, fat: 20, serving: '100g', category: 'dairy' },
  { name: 'Cheese Slice', calories: 70, protein: 4, carbs: 1, fat: 6, serving: '1 slice (20g)', category: 'dairy' },
  { name: 'Butter', calories: 100, protein: 0, carbs: 0, fat: 11, serving: '1 tbsp (10g)', category: 'dairy' },
  { name: 'Ghee', calories: 120, protein: 0, carbs: 0, fat: 14, serving: '1 tbsp (10g)', category: 'dairy' },
  { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 6, fat: 5, serving: '100g', category: 'dairy' },
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, serving: '100g cooked', category: 'protein' },
  { name: 'Fish (Rohu)', calories: 130, protein: 20, carbs: 0, fat: 5, serving: '100g', category: 'protein' },
  { name: 'Prawns', calories: 100, protein: 20, carbs: 0, fat: 2, serving: '100g', category: 'protein' },
  { name: 'Mutton Curry', calories: 270, protein: 18, carbs: 6, fat: 20, serving: '1 bowl (150g)', category: 'protein' },
  { name: 'Soy Chunks', calories: 170, protein: 24, carbs: 8, fat: 4, serving: '100g cooked', category: 'protein' },
  { name: 'Tofu', calories: 80, protein: 8, carbs: 2, fat: 5, serving: '100g', category: 'protein' },
  { name: 'Lentil Soup (Moong Dal)', calories: 100, protein: 7, carbs: 15, fat: 1, serving: '1 bowl (150g)', category: 'protein' },
  { name: 'Chickpeas (Boiled)', calories: 160, protein: 9, carbs: 27, fat: 3, serving: '1 cup (100g)', category: 'protein' },
  { name: 'Kidney Beans (Boiled)', calories: 127, protein: 9, carbs: 23, fat: 0.5, serving: '1 cup (100g)', category: 'protein' },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0.4, serving: '1 medium (120g)', category: 'fruit' },
  { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: '1 medium (150g)', category: 'fruit' },
  { name: 'Orange', calories: 60, protein: 1, carbs: 15, fat: 0.2, serving: '1 medium (130g)', category: 'fruit' },
  { name: 'Mango', calories: 100, protein: 1, carbs: 25, fat: 0.3, serving: '1 medium (150g)', category: 'fruit' },
  { name: 'Grapes', calories: 62, protein: 0.6, carbs: 16, fat: 0.3, serving: '1 cup (100g)', category: 'fruit' },
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, serving: '1 cup (150g)', category: 'fruit' },
  { name: 'Papaya', calories: 55, protein: 0.5, carbs: 14, fat: 0.2, serving: '1 cup (150g)', category: 'fruit' },
  { name: 'Guava', calories: 37, protein: 1, carbs: 9, fat: 0.4, serving: '1 medium (100g)', category: 'fruit' },
  { name: 'Pomegranate', calories: 72, protein: 1.5, carbs: 16, fat: 1, serving: '1 medium (100g)', category: 'fruit' },
  { name: 'Dates (Khajoor)', calories: 200, protein: 2, carbs: 54, fat: 0.2, serving: '5 pieces (50g)', category: 'fruit' },
  { name: 'Potato (Boiled)', calories: 87, protein: 2, carbs: 20, fat: 0.1, serving: '1 medium (100g)', category: 'vegetable' },
  { name: 'Sweet Potato', calories: 100, protein: 2, carbs: 24, fat: 0.1, serving: '1 medium (100g)', category: 'vegetable' },
  { name: 'Broccoli', calories: 34, protein: 3, carbs: 7, fat: 0.4, serving: '1 cup (100g)', category: 'vegetable' },
  { name: 'Spinach (Palak)', calories: 23, protein: 3, carbs: 4, fat: 0.4, serving: '1 cup (100g)', category: 'vegetable' },
  { name: 'Carrot', calories: 41, protein: 1, carbs: 10, fat: 0.2, serving: '1 medium (80g)', category: 'vegetable' },
  { name: 'Tomato', calories: 22, protein: 1, carbs: 5, fat: 0.2, serving: '1 medium (100g)', category: 'vegetable' },
  { name: 'Cucumber', calories: 16, protein: 0.7, carbs: 4, fat: 0.1, serving: '1 medium (100g)', category: 'vegetable' },
  { name: 'Cabbage', calories: 25, protein: 1, carbs: 6, fat: 0.1, serving: '1 cup (100g)', category: 'vegetable' },
  { name: 'Capsicum (Bell Pepper)', calories: 31, protein: 1, carbs: 6, fat: 0.3, serving: '1 medium (100g)', category: 'vegetable' },
  { name: 'Mushroom', calories: 22, protein: 3, carbs: 3, fat: 0.3, serving: '1 cup (100g)', category: 'vegetable' },
  { name: 'Almonds', calories: 170, protein: 6, carbs: 6, fat: 15, serving: '15 pieces (20g)', category: 'snack' },
  { name: 'Cashews', calories: 180, protein: 5, carbs: 9, fat: 14, serving: '15 pieces (20g)', category: 'snack' },
  { name: 'Peanuts', calories: 170, protein: 7, carbs: 5, fat: 14, serving: '20 pieces (20g)', category: 'snack' },
  { name: 'Walnuts', calories: 130, protein: 3, carbs: 3, fat: 13, serving: '5 halves (15g)', category: 'snack' },
  { name: 'Pumpkin Seeds', calories: 90, protein: 5, carbs: 3, fat: 7, serving: '1 tbsp (15g)', category: 'snack' },
  { name: 'Chia Seeds', calories: 60, protein: 2, carbs: 5, fat: 4, serving: '1 tbsp (12g)', category: 'snack' },
  { name: 'Dark Chocolate', calories: 140, protein: 2, carbs: 14, fat: 9, serving: '25g', category: 'snack' },
  { name: 'Popcorn (Plain)', calories: 90, protein: 3, carbs: 18, fat: 1, serving: '1 cup (15g)', category: 'snack' },
  { name: 'Chips (Potato)', calories: 150, protein: 2, carbs: 15, fat: 10, serving: '1 small pack (25g)', category: 'snack' },
  { name: 'Biscuits (Digestive)', calories: 120, protein: 2, carbs: 20, fat: 4, serving: '4 biscuits (30g)', category: 'snack' },
  { name: 'Namkeen / Mixture', calories: 180, protein: 4, carbs: 18, fat: 11, serving: '1 handful (30g)', category: 'snack' },
  { name: 'Makhana (Fox Nuts)', calories: 90, protein: 3, carbs: 14, fat: 2, serving: '1 cup (20g)', category: 'snack' },
  { name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fat: 7, serving: '1 bar (60g)', category: 'snack' },
  { name: 'Peanut Butter', calories: 190, protein: 8, carbs: 6, fat: 16, serving: '2 tbsp (30g)', category: 'snack' },
  { name: 'Green Tea', calories: 2, protein: 0, carbs: 0, fat: 0, serving: '1 cup (200ml)', category: 'beverage' },
  { name: 'Black Coffee', calories: 5, protein: 0, carbs: 0, fat: 0, serving: '1 cup (150ml)', category: 'beverage' },
  { name: 'Coffee with Milk', calories: 60, protein: 2, carbs: 7, fat: 3, serving: '1 cup (200ml)', category: 'beverage' },
  { name: 'Masala Chai', calories: 70, protein: 2, carbs: 10, fat: 3, serving: '1 cup (200ml)', category: 'beverage' },
  { name: 'Lassi (Sweet)', calories: 120, protein: 4, carbs: 20, fat: 3, serving: '1 glass (200ml)', category: 'beverage' },
  { name: 'Lassi (Salted)', calories: 80, protein: 4, carbs: 8, fat: 3, serving: '1 glass (200ml)', category: 'beverage' },
  { name: 'Nimbu Pani (Lemonade)', calories: 60, protein: 0, carbs: 15, fat: 0, serving: '1 glass (250ml)', category: 'beverage' },
  { name: 'Orange Juice', calories: 90, protein: 1, carbs: 21, fat: 0.3, serving: '1 glass (200ml)', category: 'beverage' },
  { name: 'Coconut Water', calories: 45, protein: 0.5, carbs: 11, fat: 0.2, serving: '1 glass (200ml)', category: 'beverage' },
  { name: 'Protein Shake', calories: 240, protein: 30, carbs: 12, fat: 5, serving: '1 scoop + water (250ml)', category: 'beverage' },
  { name: 'Smoothie (Mixed Fruit)', calories: 180, protein: 4, carbs: 36, fat: 3, serving: '1 glass (300ml)', category: 'beverage' },
  { name: 'Cola / Soft Drink', calories: 140, protein: 0, carbs: 35, fat: 0, serving: '1 can (330ml)', category: 'beverage' },
];

export const CATEGORIES = [
  { id: 'all' as const, label: 'All' },
  { id: 'indian' as const, label: 'Indian' },
  { id: 'protein' as const, label: 'Protein' },
  { id: 'fruit' as const, label: 'Fruits' },
  { id: 'vegetable' as const, label: 'Veg' },
  { id: 'dairy' as const, label: 'Dairy' },
  { id: 'grain' as const, label: 'Grains' },
  { id: 'snack' as const, label: 'Snacks' },
  { id: 'beverage' as const, label: 'Drinks' },
];

export type FoodCategory = typeof CATEGORIES[number]['id'];

export function searchFood(query: string, category: FoodCategory = 'all'): FoodItem[] {
  const q = query.toLowerCase().trim();
  let results = FOOD_DATABASE;
  if (category !== 'all') {
    results = results.filter((f) => f.category === category);
  }
  if (!q) return results;
  return results.filter(
    (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );
}