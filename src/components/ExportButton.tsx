import { useState } from 'react';
import { Download, FileText, Scale, Package } from 'lucide-react';
import { exportMeals, exportWeight, exportAll } from '../utils/exportCSV';
import type { NutritionEntry, WeightEntry } from '../types';

interface ExportButtonProps {
  entries: NutritionEntry[];
  weightEntries: WeightEntry[];
  userName: string;
}

export default function ExportButton({ entries, weightEntries, userName }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors text-sm text-[var(--text-secondary)]"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Export</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 -translate-x-1/2 sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 top-full mt-2 z-50 w-[calc(100vw-3rem)] sm:w-52 max-w-52 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden">
            <button
              onClick={() => { exportMeals(entries, userName); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors text-left"
            >
              <FileText className="w-4 h-4 text-accent" />
              <div>
                <p className="text-sm text-[var(--text-primary)] font-bold">Meals only</p>
                <p className="text-[10px] text-[var(--text-muted)]">{entries.length} entries</p>
              </div>
            </button>
            <div className="h-px bg-[var(--bg-card)]" />
            <button
              onClick={() => { exportWeight(weightEntries, userName); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors text-left"
            >
              <Scale className="w-4 h-4 text-accent" />
              <div>
                <p className="text-sm text-[var(--text-primary)] font-bold">Weight only</p>
                <p className="text-[10px] text-[var(--text-muted)]">{weightEntries.length} entries</p>
              </div>
            </button>
            <div className="h-px bg-[var(--bg-card)]" />
            <button
              onClick={() => { exportAll(entries, weightEntries, userName); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors text-left"
            >
              <Package className="w-4 h-4 text-accent" />
              <div>
                <p className="text-sm text-[var(--text-primary)] font-bold">Export all</p>
                <p className="text-[10px] text-[var(--text-muted)]">Meals + weight</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
