import type { NutritionEntry, WeightEntry } from '../types';

function escapeCSV(val: string | number): string {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** Sanitize filename to prevent path traversal and CSV injection */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().substring(0, 50) || 'user';
}

function downloadCSV(filename: string, csvContent: string) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportMeals(entries: NutritionEntry[], userName: string) {
  const headers = ['Date', 'Time', 'Food', 'Serving', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Health Note'];
  const rows = entries.map((e) => {
    const d = new Date(e.timestamp);
    const row = [
      escapeCSV(d.toLocaleDateString('en-IN')),
      escapeCSV(d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })),
      escapeCSV(e.name),
      escapeCSV(e.serving),
      escapeCSV(Math.round(e.calories)),
      escapeCSV(Math.round(e.protein)),
      escapeCSV(Math.round(e.carbs)),
      escapeCSV(Math.round(e.fat)),
      escapeCSV(e.healthInsight || ''),
    ];
    return row.join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadCSV('NutriVision_Meals_' + sanitizeFilename(userName) + '_' + date + '.csv', csv);
}

export function exportWeight(entries: WeightEntry[], userName: string) {
  const headers = ['Date', 'Weight (kg)'];
  const rows = entries.map((e) => {
    return [escapeCSV(e.date), escapeCSV(e.weight)].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadCSV('NutriVision_Weight_' + sanitizeFilename(userName) + '_' + date + '.csv', csv);
}

export function exportAll(entries: NutritionEntry[], weightEntries: WeightEntry[], userName: string) {
  const date = new Date().toISOString().split('T')[0];

  const mealRows = entries.map((e) => {
    const d = new Date(e.timestamp);
    const row = [
      escapeCSV(d.toLocaleDateString('en-IN')),
      escapeCSV(d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })),
      escapeCSV(e.name),
      escapeCSV(e.serving),
      escapeCSV(Math.round(e.calories)),
      escapeCSV(Math.round(e.protein)),
      escapeCSV(Math.round(e.carbs)),
      escapeCSV(Math.round(e.fat)),
      escapeCSV(e.healthInsight || ''),
    ];
    return row.join(',');
  });

  const weightRows = weightEntries.map((e) => {
    return [escapeCSV(e.date), escapeCSV(e.weight)].join(',');
  });

  const parts = [
    '=== MEAL LOG ===',
    'Date,Time,Food,Serving,Calories,Protein (g),Carbs (g),Fat (g),Health Note',
    ...mealRows,
    '',
    '=== WEIGHT LOG ===',
    'Date,Weight (kg)',
    ...weightRows,
  ];

  const csv = parts.join('\n');
  downloadCSV('NutriVision_Export_' + sanitizeFilename(userName) + '_' + date + '.csv', csv);
}
