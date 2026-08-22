import { useEffect, useRef, useState } from 'react';
import { X, ScanBarcode } from 'lucide-react';

interface BarcodeScannerProps {
  onResult: (food: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string }) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: any = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!containerRef.current) return;

        scanner = new Html5Qrcode('barcode-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          async (decodedText: string) => {
            // Stop scanner on successful scan
            try { await scanner.stop(); } catch {}
            setLoading(true);
            setError(null);

            try {
              const response = await fetch(
                `https://world.openfoodfacts.org/api/v2/product/${decodedText}.json`
              );
              const data = await response.json();

              if (data.status === 1 && data.product) {
                const p = data.product;
                const name = p.product_name || p.product_name_en || 'Unknown Product';
                const nutriments = p.nutriments || {};
                onResult({
                  name,
                  calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal_serving'] || 0),
                  protein: Math.round((nutriments.proteins_100g || nutriments.proteins_serving || 0) * 10) / 10,
                  carbs: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates_serving || 0) * 10) / 10,
                  fat: Math.round((nutriments.fat_100g || nutriments.fat_serving || 0) * 10) / 10,
                  serving: p.serving_size || '100g',
                });
              } else {
                setError(`Product not found (${decodedText}). Try searching instead.`);
              }
            } catch {
              setError('Could not fetch product data. Check your connection.');
            }
            setLoading(false);
          },
          () => {} // ignore scan failures
        );
      } catch (err: any) {
        setError('Camera access denied or not available. Please allow camera permissions.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
        try { scannerRef.current.clear(); } catch {}
      }
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Scan Barcode</h3>
          </div>
          <button onClick={onClose}>
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="relative">
          <div id="barcode-reader" ref={containerRef} className="w-full" />

          {loading && (
            <div className="absolute inset-0 bg-[var(--bg-base)]/90 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[var(--accent)] rounded-full animate-spin mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Looking up product...</p>
            </div>
          )}

          {error && (
            <div className="p-4">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-[var(--border-color)] text-center">
          <p className="text-[10px] text-[var(--text-muted)]">Point your camera at a barcode on any food package</p>
        </div>
      </div>
    </div>
  );
}
