import { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('pwa_install_dismissed') === 'true';
  });

  useEffect(() => {
    // Already installed as app
    if (isStandalone()) return;
    if (dismissed) return;

    // Android / Chrome: wait for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: show hint after 5 seconds if not standalone
    if (isIOS()) {
      const timer = setTimeout(() => setShowIOSHint(true), 5000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  // Hide if already installed
  useEffect(() => {
    const handler = () => {
      setShowBanner(false);
      setShowIOSHint(false);
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSHint(false);
    setDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Android / Chrome install banner
  if (showBanner && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-5xl mx-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Install NutriVision</p>
            <p className="text-xs text-[var(--text-muted)]">Add to home screen for offline access</p>
          </div>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dim transition-colors flex-shrink-0"
          >
            Install
          </button>
          <button onClick={handleDismiss} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // iOS install hint
  if (showIOSHint && isIOS() && !isStandalone()) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-5xl mx-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Plus className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold mb-1">Install NutriVision</p>
              <div className="text-xs text-[var(--text-muted)] space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--text-secondary)]">1.</span>
                  Tap the <Share className="w-3 h-3 inline" /> Share button below
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--text-secondary)]">2.</span>
                  Scroll down and tap <span className="font-semibold">"Add to Home Screen"</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--text-secondary)]">3.</span>
                  Tap <span className="font-semibold">Add</span> in the top right
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
