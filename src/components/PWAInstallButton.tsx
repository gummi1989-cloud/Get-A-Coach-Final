import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [promptAvailable, setPromptAvailable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if ((window as any).deferredPWAInstallPrompt) {
      setPromptAvailable(true);
    }

    const handler = () => {
      setPromptAvailable(true);
    };

    window.addEventListener('pwa-ready-to-install', handler);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      (window as any).deferredPWAInstallPrompt = e;
      setPromptAvailable(true);
    });

    return () => {
      window.removeEventListener('pwa-ready-to-install', handler);
    };
  }, []);

  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPWAInstallPrompt;

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          (window as any).deferredPWAInstallPrompt = null;
          setPromptAvailable(false);
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else {
      // Wenn Chrome das Event auf Android blockiert, weil bereits eine Verknüpfung existiert
      alert('Hinweis: Auf deinem Smartphone ist die App möglicherweise bereits registriert. Falls noch ein altes Icon auf dem Startbildschirm liegt, lösche dieses bitte zuerst. Alternativ tippe oben rechts auf die 3 Punkte in Chrome und wähle «App installieren».');
    }
  };

  return (
    <button
      onClick={handleInstallClick}
      type="button"
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg active:scale-95 transition duration-150 cursor-pointer ${className}`}
    >
      <Download className="w-4 h-4 text-white" />
      <span>App installieren</span>
    </button>
  );
};
