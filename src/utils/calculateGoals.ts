import { ACTIVITY_MULTIPLIERS } from '../types';

export interface CalculatedGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
  bmi: number;
  bmiCategory: string;
}

export function calculateAllGoals(params: {
  weight: string;
  height: string;
  age: string;
  gender: string;
  goal: string;
  activityLevel: string;
}): CalculatedGoals {
  const weight = parseFloat(params.weight) || 70;
  const height = parseFloat(params.height) || 170;
  const age = parseFloat(params.age) || 30;

  // BMR (Mifflin-St Jeor)
  let bmr: number;
  if (params.gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  // TDEE
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[params.activityLevel] || 1.2);

  // Calorie goal based on goal
  let calorieGoal = tdee;
  let proteinPerKg = 1.6;

  if (params.goal === 'weight-loss') { calorieGoal = tdee - 500; proteinPerKg = 2.0; }
  else if (params.goal === 'weight-gain') { calorieGoal = tdee + 500; proteinPerKg = 1.8; }
  else if (params.goal === 'muscle-gain') { calorieGoal = tdee + 300; proteinPerKg = 2.2; }
  else if (params.goal === 'athletic-performance') { calorieGoal = tdee + 200; proteinPerKg = 1.8; }

  const protein = weight * proteinPerKg;
  const fat = (calorieGoal * 0.25) / 9;
  const carbs = (calorieGoal - protein * 4 - fat * 9) / 4;

  // BMI
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  return {
    calories: Math.round(calorieGoal),
    protein: Math.round(protein),
    carbs: Math.round(Math.max(carbs, 0)),
    fat: Math.round(fat),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
  };
}
